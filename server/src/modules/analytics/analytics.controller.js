import { getDashboardStats } from './analytics.service.js';

export async function dashboard(req, res, next) {
  try {
    const stats = await getDashboardStats(req.user);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}