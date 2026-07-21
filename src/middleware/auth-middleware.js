import createError from "http-errors";
import { verifyToken } from "../../lib/jwt.js";

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return next(createError(401, 'Authentication is required'));
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return next(
            createError(401, "Invalid authorization header")
        );
    }

    try {
        req.user = verifyToken(token);

        next();
    } catch  {
        next(createError(401, 'Invalid token'));
        
    }
}