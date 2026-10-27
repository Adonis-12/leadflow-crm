import { listUsers, updateUserRole } from './user.service.js';

export async function getUsers(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const result = await listUsers({ page, limit });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body ?? {};

    if (!['ADMIN', 'SALES_REP'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be ADMIN or SALES_REP.',
      });
    }

    const user = await updateUserRole(req.params.id, role);

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}