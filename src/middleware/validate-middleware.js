import createError from 'http-errors';

export function validate(schema, location = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[location]);

    if (!result.success) {
      return next(createError(400, result.error.issues[0].message));
    }

    if (location === 'query') {
      req.validatedQuery = result.data;
    } else {
      req[location] = result.data;
    }

    next();
  };
}
