import { Types } from "mongoose";
import { Comment } from "../models/Comment.js";
import { catchAsync } from "../util/catchAsync.js";
import { AppError } from "../util/appError.js";
import { logActivity } from "./activityController.js";

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
        ],
        as: "replies",
      },
    },
    {
      $addFields: {
        replyCount: { $size: "$replies" },
      },
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
    teamId: ticketId,
    details: {
      text,
      commentId,
    },
  });

  return res.status(201).json({
    status: "success",
    data: {
      comment,
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
  ]);

  if (!thread.length) return next(new AppError("Comment not found", 404));

  return res.status(200).json({
    status: "success",
    data: {
      thread: thread[0],
    },
  });
});
