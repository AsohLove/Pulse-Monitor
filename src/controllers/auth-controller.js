import bcrypt from 'bcrypt';
import createError from 'http-errors';

import { comparePassword } from '../../lib/password.js';
import { createToken } from '../../lib/jwt.js';

import * as users from '../models/user-model.js';

export async function register(req, res, next) {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = await users.create(req.body.email, hash);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(createError(409, 'Email already exists!!'));
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await users.findUserByEmail(email);

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      throw createError(401, 'Invalid email or password');
    }

    const token = createToken(user);

    res.json({
      success: true,
      data: token,
    });
  } catch (err) {
    next(err);
  }
}
