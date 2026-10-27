
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import prisma from '../../config/prisma.js';

const ACCESS_TOKEN_TTL =
  process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

const REFRESH_TOKEN_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7
);

const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
};

const createRefreshSession = async (userId) => {
  const refreshToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshSession.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt,
    },
  });

  return { refreshToken, expiresAt };
};

const createAuthResult = async (user) => {
  const { refreshToken } = await createRefreshSession(user.id);

  return {
    user: publicUser(user),
    accessToken: createAccessToken(user),
    refreshToken,
  };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      // Never accept a role from public registration.
    },
  });

  return createAuthResult(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return createAuthResult(user);
};

export const refreshUser = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token required');
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashToken(refreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date()
  ) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  // Atomically consume the existing session so it cannot be reused.
  const consumed = await prisma.refreshSession.updateMany({
    where: {
      id: session.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { revokedAt: new Date() },
  });

  if (consumed.count !== 1) {
    const error = new Error('Refresh token has already been used');
    error.statusCode = 401;
    throw error;
  }

  const user = session.user;

  // Do not issue new tokens for a missing user.
  if (!user) {
    const error = new Error('User no longer exists');
    error.statusCode = 401;
    throw error;
  }

  const { refreshToken: newRefreshToken } =
    await createRefreshSession(user.id);

  return {
    user: publicUser(user),
    accessToken: createAccessToken(user),
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  await prisma.refreshSession.updateMany({
    where: {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
};
