const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/dispatch  — create a batch dispatch
router.post('/', async (req, res) => {
  try {
    const { orderIds, totalShippingCost, notes } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }
    if (totalShippingCost == null) {
      return res.status(400).json({ error: 'totalShippingCost is required' });
    }

    const ids = orderIds.map((id) => parseInt(id));
    const count = ids.length;
    const perOrderShipping = parseFloat(totalShippingCost) / count;

    // Verify all orders exist and are CONFIRMED
    const orders = await prisma.order.findMany({ where: { id: { in: ids } } });
    if (orders.length !== count) {
      return res.status(400).json({ error: 'One or more orders not found' });
    }
    const nonConfirmed = orders.filter((o) => o.status !== 'CONFIRMED');
    if (nonConfirmed.length > 0) {
      return res.status(400).json({
        error: `Orders must be CONFIRMED before dispatch. Non-confirmed: ${nonConfirmed.map((o) => o.id).join(', ')}`,
      });
    }

    // Create batch and update all orders in a transaction
    const batch = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.dispatchBatch.create({
        data: {
          totalShippingCost: parseFloat(totalShippingCost),
          perOrderShipping,
          orderCount: count,
          notes: notes || null,
          batchOrders: {
            create: ids.map((orderId) => ({ orderId })),
          },
        },
        include: { batchOrders: true },
      });

      // Update each order: status + shipping cost
      for (const orderId of ids) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'DISPATCHED',
            shippingCost: perOrderShipping,
          },
        });
      }

      return newBatch;
    });

    res.status(201).json({
      batch,
      summary: `${count} order${count > 1 ? 's' : ''} dispatched. Shipping: Rs. ${perOrderShipping.toFixed(0)} each.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dispatch  — list all dispatch batches
router.get('/', async (req, res) => {
  try {
    const batches = await prisma.dispatchBatch.findMany({
      include: {
        batchOrders: {
          include: {
            order: { include: { items: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
