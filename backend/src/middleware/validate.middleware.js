import { sendError } from '../utils/response.helper.js';

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      return sendError(res, 400, firstError.message);
    }

    req.validated = result.data;
    next();
  };
}

export default validate;