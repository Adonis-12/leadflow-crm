
import prisma from '../../config/prisma.js';

const activitySelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  dueDate: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
  lead: {
    select: { id: true, name: true, company: true },
  },
  owner: {
    select: { id: true, name: true, email: true },
  },
};

const isAdmin = (user) => user.role === 'ADMIN';

export async function createActivity(data, user) {
  if (data.leadId) {
    const leadWhere = isAdmin(user)
      ? { id: data.leadId }
      : {
          id: data.leadId,
          OR: [
            { createdById: user.id },
            { assignedToId: user.id },
          ],
        };

    const lead = await prisma.lead.findFirst({ where: leadWhere });

    if (!lead) {
      const error = new Error('Lead not found or access denied');
      error.statusCode = 404;
      throw error;
    }
  }

  return prisma.activity.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      leadId: data.leadId || null,
      ownerId: user.id,
    },
    select: activitySelect,
  });
}

export async function listActivities(query, user) {
  const { page, limit, type, completed } = query;

  const where = {
    ...(isAdmin(user) ? {} : { ownerId: user.id }),
    ...(type ? { type } : {}),
    ...(completed !== undefined ? { completed: completed === 'true' } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      select: activitySelect,
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
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
}

export async function updateActivity(id, data, user) {
  const where = {
    id,
    ...(isAdmin(user) ? {} : { ownerId: user.id }),
  };

  const existing = await prisma.activity.findFirst({ where });

  if (!existing) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.leadId) {
    const leadWhere = isAdmin(user)
      ? { id: data.leadId }
      : {
          id: data.leadId,
          OR: [
            { createdById: user.id },
            { assignedToId: user.id },
          ],
        };

    const lead = await prisma.lead.findFirst({ where: leadWhere });

    if (!lead) {
      const error = new Error('Lead not found or access denied');
      error.statusCode = 404;
      throw error;
    }
  }

  return prisma.activity.update({
    where: { id },
    data: {
      ...data,
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.leadId !== undefined && {
        leadId: data.leadId || null,
      }),
    },
    select: activitySelect,
  });
}

export async function deleteActivity(id, user) {
  const where = {
    id,
    ...(isAdmin(user) ? {} : { ownerId: user.id }),
  };

  const existing = await prisma.activity.findFirst({ where });

  if (!existing) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.activity.delete({ where: { id } });

  return { id };
}
