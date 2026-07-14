import { z } from 'zod';

export const registerSchema = z.object({
    email: z  
        .string({required_error: 'an email is required'})
        .email('you should provide a valid email')
        .max(200, 'your email is too long (max should be 200 characters)'),

    password: z
        .string({ required_error: 'a password is required'})
        .min(8, 'password entered must be at least 8 characters')
        .max(200, 'password is too lengthy (max 200 characters)')
})

export const loginSchema = registerSchema;
