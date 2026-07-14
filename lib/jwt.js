import jwt  from "jsonwebtoken";
import { config } from "../src/config.js";

const EXPIRES_IN = "7d"


export function createToken(user) {
    return jwt.sign({
        sub: user.id,
        email: user.email
        }, 
        config.jwtSecret,
        {
            expiresIn: EXPIRES_IN
        }
    );  
}

export function verifyToken(token){
    return jwt.verify(token, config.jwtSecret);
}