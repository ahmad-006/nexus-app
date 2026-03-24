import { AppError } from "../util/appError";

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("--------ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
const sendCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const sendDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;

  return new AppError(message, 400);
};
const sendValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const sendJWTInvalidToken = (err) => {
  const message = "Invalid token. Please log in again";
  return new AppError(message, 401);
};
const sendJWTExpiredToken = (err) => {
  const message = "Your token has expired. Please log in again";
  return new AppError(message, 401);
};

/**
 * @desc    Global Central Error Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.stack = err.stack;
    error.statusCode = err.statusCode;
    error.status = err.status;

    if (error.name === "CastError") error = sendCastErrorDB(error);
    if (err.code === 11000) error = sendDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = sendValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = sendJWTInvalidToken(error);
    if (err.name === "TokenExpiredError") error = sendJWTExpiredToken(error);
    // if (err.code === "MulterError") error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};
