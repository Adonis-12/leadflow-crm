
import * as activityService from './activity.service.js';

export async function create(req, res, next) {
  try {
    const activity = await activityService.createActivity(req.body, req.user);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const result = await activityService.listActivities(
      res.locals.validatedQuery,
      req.user,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const activity = await activityService.updateActivity(
      req.params.id,
      req.body,
      req.user,
    );
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await activityService.deleteActivity(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
