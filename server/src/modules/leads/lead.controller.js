
import * as leadService from './lead.service.js';

export const create = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, req.user);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await leadService.listLeads(
      res.locals.validatedQuery,
      req.user
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(
      req.params.id,
      req.body,
      req.user
    );
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await leadService.deleteLead(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
