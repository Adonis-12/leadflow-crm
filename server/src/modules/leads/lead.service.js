
import prisma from '../../config/prisma.js';

const leadSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  source: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  assignedToId: true,
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
};

const isAdmin = (user) => user.role === 'ADMIN';

const accessibleLeadWhere = (user) =>
  isAdmin(user)
    ? {}
    : {
        OR: [
          { createdById: user.id },
          { assignedToId: user.id },
        ],
      };

const notFound = () => {
  const error = new Error('Lead not found');
  error.statusCode = 404;
  return error;
};

const forbidden = () => {
  const error = new Error('Insufficient permissions');
  error.statusCode = 403;
  return error;
};

export const createLead = async (data, user) => {
  let assignedToId = user.id;

  if (isAdmin(user)) {
    assignedToId = data.assignedToId ?? user.id;
  } else if (
    data.assignedToId &&
    data.assignedToId !== user.id
  ) {
    throw forbidden();
  }

  if (assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true },
    });

    if (!assignee) {
      const error = new Error('Assigned user not found');
      error.statusCode = 400;
      throw error;
    }
  }

  const { assignedToId: ignored, ...leadData } = data;

  return prisma.lead.create({
    data: {
      ...leadData,
      createdById: user.id,
      assignedToId,
    },
    select: leadSelect,
  });
};

export const listLeads = async (query, user) => {
  const { page, limit, search, status } = query;

  const where = {
    ...accessibleLeadWhere(user),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  // Combine access restrictions and search in AND so the search
  // cannot accidentally bypass ownership restrictions.
  const access = accessibleLeadWhere(user);
  const filters = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const finalWhere = {
    AND: [access, filters],
  };

  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where: finalWhere,
      select: leadSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where: finalWhere }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLeadById = async (id, user) => {
  const lead = await prisma.lead.findFirst({
    where: {
      AND: [
        { id },
        accessibleLeadWhere(user),
      ],
    },
    select: leadSelect,
  });

  if (!lead) throw notFound();

  return lead;
};

export const updateLead = async (id, data, user) => {
  const existing = await prisma.lead.findFirst({
    where: {
      AND: [
        { id },
        accessibleLeadWhere(user),
      ],
    },
    select: { id: true },
  });

  if (!existing) throw notFound();

  if (data.assignedToId !== undefined && !isAdmin(user)) {
    throw forbidden();
  }

  if (data.assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: data.assignedToId },
      select: { id: true },
    });

    if (!assignee) {
      const error = new Error('Assigned user not found');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.lead.update({
    where: { id },
    data,
    select: leadSelect,
  });
};

export const deleteLead = async (id, user) => {
  if (!isAdmin(user)) throw forbidden();

  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) throw notFound();

  await prisma.lead.delete({ where: { id } });

  return { id };
};
