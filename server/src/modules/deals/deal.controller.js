import * as dealService from './deal.service.js';

export async function create(req, res, next) {
  try {
    const deal = await dealService.createDeal(req.body, req.user);

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const result = await dealService.listDeals(
      res.locals.validatedQuery,
      req.user,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const deal = await dealService.getDealById(req.params.id, req.user);

    res.status(200).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const deal = await dealService.updateDeal(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await dealService.deleteDeal(req.params.id, req.user);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}