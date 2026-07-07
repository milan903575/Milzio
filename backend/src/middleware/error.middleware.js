import { sendError } from '../utils/response.helper.js';

function errorHandler(req, res, next, err) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';

  sendError(res, statusCode, message);
}

export default errorHandler;