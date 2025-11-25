import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import prisma from '../../database/prisma';
import { config } from '../../shared/config/env';
import { Usuario } from '../../../prisma/generated/client';

export const registerUser = async (data: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'image'>): Promise<Omit<Usuario, 'password'>> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await prisma.usuario.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (credentials: Pick<Usuario, 'email' | 'password'>): Promise<{ token: string; user: Omit<Usuario, 'password'> } | null> => {
  const user = await prisma.usuario.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  interface JwtAuthPayload {
    userId: typeof user.id;
    email: string;
  }

  const payloadForToken: JwtAuthPayload = { userId: user.id, email: user.email };
  const jwtSecret: Secret = config.jwt.secret;
  const jwtSignOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn
  };

  const token = jwt.sign(payloadForToken, jwtSecret, jwtSignOptions);

  const { password, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};
