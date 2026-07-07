function sendSuccess(res, statusCode, message, data) {
  res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    data
  });
}

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
}

export {
  sendSuccess,
  sendError
}