import { Types } from "mongoose";
import { Comment } from "../models/Comment.js";
import { Ticket } from "../models/Ticket.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { logActivity } from "./activityController.js";
import { socketManager } from "../util/socket.js";

/**
 * @desc    Get all top-level comments for a specific ticket
 * @route   GET /api/tickets/:ticketId/comments
 * @access  Private (Member)
 */
export const getComments = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;

  const comments = await Comment.aggregate([
    {
      $match: {
        ticketId: new Types.ObjectId(ticketId),
        parentCommentId: null,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $lookup: {
        from: "comments",
        let: { commentId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$parentCommentId", "$$commentId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 2 },
          {
            $lookup: {
              from: "users",
              localField: "authorId",
              foreignField: "_id",
              as: "author"
            }
          },
          { $unwind: "$author" },
          {
            $project: {
              "author.password": 0,
              "author.email": 0,
              "author.teams": 0
            }
          }
        ],
        as: "replies",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parentCommentId",
        as: "allReplies",
      },
    },
    {
      $addFields: {
        replyCount: { $size: "$allReplies" },
      },
    },
    {
      $project: {
        "allReplies": 0,
        "author.password": 0,
        "author.email": 0,
        "author.teams": 0,
        "author.passwordChangedAt": 0,
        "author.resetToken": 0,
        "author.resetTokenExpiration": 0,
        "author.__v": 0,
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: {
      comments,
    },
  });
});

/**
 * @desc    Post a comment or reply to a ticket
 * @route   POST /api/tickets/:ticketId/comments
 * @access  Private (Member)
 */
export const postComment = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  const { text, commentId } = req.body;
  if (!text) return next(new AppError("Comment Text is required", 400));

  // Find ticket to get teamId for activity log
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  const comment = new Comment({
    ticketId,
    text,
    authorId: req.user.id,
    parentCommentId: commentId || null,
  });
  await comment.save();

  //LOGGING ACTIVITY
  logActivity({
    userId: req.user.id,
    action: "COMMENT_CREATED",
    resourceType: "Comment", 
    resourceId: comment._id,
    teamId: ticket.teamId,
    details: {
      text,
      commentId: comment._id,
    },
  });

  // Prepare populated payload for Socket.io
  const populatedComment = {
    ...comment.toObject(),
    author: {
      _id: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar,
    },
    replies: [],
    replyCount: 0
  };

  // Broadcast to anyone in the ticket room
  socketManager.getIO().to(`ticket_${ticketId}`).emit("receive_comment", populatedComment);

  return res.status(201).json({
    status: "success",
    data: {
      comment: populatedComment,
    },
  });
});

/**
 * @desc    Update a specific comment
 * @route   PATCH /api/comments/:commentId
 * @access  Private (Author)
 */
export const patchComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) return next(new AppError("Comment not found", 404));
  if (comment.authorId.toString() !== req.user.id)
    return next(
      new AppError("You are not authorized to edit this comment", 403),
    );
  if (!text) return next(new AppError("Comment text is required", 400));

  comment.text = text;
  comment.isEdited = true;
  await comment.save();
  
  // Broadcast edit to ticket room
  socketManager.getIO().to(`ticket_${comment.ticketId}`).emit("update_comment", {
    _id: comment._id,
    text: comment.text,
    isEdited: true,
    parentCommentId: comment.parentCommentId
  });

  return res.status(200).json({
    status: "success",
    data: {
      comment,
    },
  });
});

/**
 * @desc    Delete a specific comment
 * @route   DELETE /api/comments/:commentId
 * @access  Private (Author)
 */
export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) return next(new AppError("Comment not found", 404));
  if (comment.authorId.toString() !== req.user.id)
    return next(
      new AppError("You are not authorized to delete this comment", 403),
    );
  await Comment.findByIdAndDelete(commentId);

  // Broadcast deletion to ticket room
  socketManager.getIO().to(`ticket_${comment.ticketId}`).emit("delete_comment", {
    _id: commentId,
    parentCommentId: comment.parentCommentId
  });

  return res.status(204).json({ status: "success", data: null });
});

/**
 * @desc    Get all replies for a specific comment (threaded)
 * @route   GET /api/comments/:commentId/replies
 * @access  Private (Member)
 */
export const getReplies = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  if (!commentId) return next(new AppError("commentId is required", 400));

  const thread = await Comment.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(commentId),
      },
    },
    {
      $graphLookup: {
        from: "comments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentCommentId",
        as: "replies",
        maxDepth: 5,
        depthField: "level",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $project: {
        "author.password": 0,
        "author.email": 0,
        "author.teams": 0,
        "author.passwordChangedAt": 0,
        "author.resetToken": 0,
        "author.resetTokenExpiration": 0,
        "author.__v": 0,
      },
    },
    {
      $unwind: { path: "$replies", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "replies.authorId",
        foreignField: "_id",
        as: "replies.author",
      },
    },
    {
      $unwind: { path: "$replies.author", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        "replies.author.password": 0,
        "replies.author.email": 0,
        "replies.author.teams": 0,
        "replies.author.passwordChangedAt": 0,
        "replies.author.resetToken": 0,
        "replies.author.resetTokenExpiration": 0,
        "replies.author.__v": 0,
      },
    },
    {
      $sort: { "replies.createdAt": 1 }
    },
    {
      $group: {
        _id: "$_id",
        ticketId: { $first: "$ticketId" },
        text: { $first: "$text" },
        type: { $first: "$type" },
        createdAt: { $first: "$createdAt" },
        isEdited: { $first: "$isEdited" },
        author: { $first: "$author" },
        replyCount: { $first: "$replyCount" },
        replies: { 
          $push: {
            $cond: [
              { $ifNull: ["$replies._id", false] },
              "$replies",
              "$$REMOVE"
            ]
          }
        },
      },
    },
  ]);

  if (!thread.length) return next(new AppError("Comment not found", 404));

  return res.status(200).json({
    status: "success",
    data: {
      thread: thread[0],
    },
  });
});
