import prisma from '../../config/prisma.js';

const dealSelect = {
  id: true,
  title: true,
  value: true,
  stage: true,
  expectedCloseDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  lead: {
    select: { id: true, name: true, company: true, email: true },
  },
  owner: {
    select: { id: true, name: true, email: true, role: true },
  },
};

const isAdmin = (user) => user.role === 'ADMIN';

function accessibleDealWhere(user) {
  return isAdmin(user) ? {} : { ownerId: user.id };
}

export async function createDeal(data, user) {
  // Sales reps can only create deals for leads they can access.
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

  const { leadId, expectedCloseDate, ...rest } = data;

  return prisma.deal.create({
    data: {
      ...rest,
      value: data.value ?? 0,
      leadId,
      ownerId: user.id,
      expectedCloseDate: expectedCloseDate
        ? new Date(expectedCloseDate)
        : null,
    },
    select: dealSelect,
  });
}

export async function listDeals(query, user) {
  const { page, limit, search, stage } = query;

  const where = {
    ...accessibleDealWhere(user),
    ...(stage ? { stage } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { lead: { name: { contains: search, mode: 'insensitive' } } },
            { lead: { company: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.deal.findMany({
      where,
      select: dealSelect,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deal.count({ where }),
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

export async function getDealById(id, user) {
  const deal = await prisma.deal.findFirst({
    where: { id, ...accessibleDealWhere(user) },
    select: dealSelect,
  });

  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  return deal;
}

export async function updateDeal(id, data, user) {
  const existing = await prisma.deal.findFirst({
    where: { id, ...accessibleDealWhere(user) },
  });

  if (!existing) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  const { expectedCloseDate, ...rest } = data;

  return prisma.deal.update({
    where: { id },
    data: {
      ...rest,
      ...(expectedCloseDate !== undefined && {
        expectedCloseDate: expectedCloseDate
          ? new Date(expectedCloseDate)
          : null,
      }),
    },
    select: dealSelect,
  });
}

export async function deleteDeal(id, user) {
  if (!isAdmin(user)) {
    const error = new Error('Only admins can delete deals');
    error.statusCode = 403;
    throw error;
  }

  const existing = await prisma.deal.findUnique({ where: { id } });

  if (!existing) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.deal.delete({ where: { id } });

  return { id };
}