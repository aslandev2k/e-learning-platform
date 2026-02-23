import z from 'zod';
import { commonZod } from '../common';

const { username, password, newPassword } = commonZod;

export const changePasswordSchema = z.object({
  username: commonZod.username,
  oldPassword: commonZod.password.optional(),
  newPassword,
});

export const signInSchema = z.object({
  username,
  password,
});
