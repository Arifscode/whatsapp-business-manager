const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getPeriodDates(period) {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'all':
    default:
      return null;
  }

  return { gte: start, lte: now };
}

// GET /api/financials?period=today|week|month|all
router.get('/', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const dateRange = getPeriodDates(period);

    const orderWhere = {
      status: 'DELIVERED',
      ...(dateRange && { updatedAt: dateRange }),
    };

    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: { items: true, packagingUsages: true },
    });

    const expenseWhere = dateRange ? { expenseDate: dateRange } : {};
    const expenses = await prisma.expense.findMany({ where: expenseWhere });

    let revenue = 0;
    let productCost = 0;
    let packagingCost = 0;
    let shippingCost = 0;
    const productProfitMap = {};

    for (const order of orders) {
      for (const item of order.items) {
        const itemRevenue = (item.sellingPrice || 0) * item.quantity;
        const itemCost = (item.buyingPrice || 0) * item.quantity;
        revenue += itemRevenue;
        productCost += itemCost;

        if (item.productId) {
          if (!productProfitMap[item.productId]) {
            productProfitMap[item.productId] = {
              productId: item.productId,
              name: item.itemDesc,
              revenue: 0,
              cost: 0,
              profit: 0,
            };
          }
          productProfitMap[item.productId].revenue += itemRevenue;
          productProfitMap[item.productId].cost += itemCost;
          productProfitMap[item.productId].profit += itemRevenue - itemCost;
        }
      }

      for (const usage of order.packagingUsages) {
        packagingCost += usage.totalCost;
      }

      shippingCost += order.shippingCost || 0;
    }

    const otherExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = productCost + packagingCost + shippingCost + otherExpenses;
    const grossProfit = revenue - totalCost;
    const marginPercent = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0;

    const topProducts = Object.values(productProfitMap)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    res.json({
      period,
      orderCount: orders.length,
      revenue: Math.round(revenue),
      costs: {
        product: Math.round(productCost),
        packaging: Math.round(packagingCost),
        shipping: Math.round(shippingCost),
        other: Math.round(otherExpenses),
        total: Math.round(totalCost),
      },
      grossProfit: Math.round(grossProfit),
      marginPercent,
      topProducts,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
