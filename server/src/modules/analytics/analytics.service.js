
import prisma from '../../config/prisma.js';

export async function getDashboardStats(user) {
  const isAdmin = user.role === 'ADMIN';

  const leadWhere = isAdmin
    ? {}
    : {
        OR: [
          { createdById: user.id },
          { assignedToId: user.id },
        ],
      };

  const dealWhere = isAdmin ? {} : { ownerId: user.id };

  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    totalDeals,
    activeDeals,
    wonDeals,
    lostDeals,
    wonRevenue,
    dealsByStage,
    leadsByStatus,
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: 'NEW' } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'QUALIFIED' } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'CONVERTED' } }),
    prisma.deal.count({ where: dealWhere }),
    prisma.deal.count({
      where: {
        ...dealWhere,
        stage: { in: ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'] },
      },
    }),
    prisma.deal.count({ where: { ...dealWhere, stage: 'WON' } }),
    prisma.deal.count({ where: { ...dealWhere, stage: 'LOST' } }),
    prisma.deal.aggregate({
      where: { ...dealWhere, stage: 'WON' },
      _sum: { value: true },
    }),
    prisma.deal.groupBy({
      by: ['stage'],
      where: dealWhere,
      _count: { _all: true },
      _sum: { value: true },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: leadWhere,
      _count: { _all: true },
    }),
  ]);

  const conversionRate = totalLeads
    ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
    : 0;

  return {
    summary: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      totalDeals,
      activeDeals,
      wonDeals,
      lostDeals,
      wonRevenue: Number(wonRevenue._sum.value ?? 0),
      conversionRate,
    },
    dealsByStage: dealsByStage.map((item) => ({
      stage: item.stage,
      count: item._count._all,
      value: Number(item._sum.value ?? 0),
    })),
    leadsByStatus: leadsByStatus.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
  };
}
