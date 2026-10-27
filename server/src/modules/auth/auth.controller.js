
import {
  registerUser,
  loginUser,
  refreshUser,
  logoutUser,
} from './auth.service.js';

const COOKIE_NAME = 'lf_refresh';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  path: '/api/auth',
});

const setRefreshCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge:
      Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7) *
      24 *
      60 *
      60 *
      1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
};

const sendAuthResult = (res, result, statusCode = 200) => {
  setRefreshCookie(res, result.refreshToken);

  const { refreshToken, ...publicResult } = result;

  return res.status(statusCode).json({
    success: true,
    data: publicResult,
  });
};

// Register a new user
export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return sendAuthResult(res, result, 201);
  } catch (error) {
    next(error);
  }
};

// Log in an existing user
export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

// Refresh the access token using the HttpOnly cookie
export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies?.[COOKIE_NAME];

  if (!refreshToken) {
    clearRefreshCookie(res);

    return res.status(401).json({
      success: false,
      message: 'No refresh session',
    });
  }

  try {
    const result = await refreshUser(refreshToken);
    return sendAuthResult(res, result);
  } catch (error) {
    clearRefreshCookie(res);

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: 'Refresh session expired. Please sign in again.',
      });
    }

    next(error);
  }
};

// Log out and revoke the refresh session
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAME];

    await logoutUser(refreshToken);
    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Return the currently authenticated user
export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
