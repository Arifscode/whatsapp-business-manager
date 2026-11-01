const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

// ─── Public router (no auth) ────────────────────────────────────────────────
const publicRouter = express.Router();

// POST /api/orders/public  — customer order form submission
publicRouter.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, itemDesc, quantity, deliveryAddress, notes } = req.body;

    if (!customerName || !customerPhone || !itemDesc || !deliveryAddress) {
      return res.status(400).json({
        error: 'Name, phone, item description, and delivery address are required',
      });
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
        source: 'FORM',
        items: {
          create: {
            itemDesc: itemDesc.trim(),
            quantity: parseInt(quantity) || 1,
          },
        },
      },
      include: { items: true },
    });

    res.status(201).json({
      message: `Thank you ${customerName}! Your order has been received. We'll contact you on ${customerPhone} to confirm.`,
      orderId: order.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Protected router (requires auth middleware in index.js) ─────────────────
const protectedRouter = express.Router();

// GET /api/orders
protectedRouter.get('/', async (req, res) => {
  try {
    const { status, source } = req.query;
    const where = {};
    if (status) where.status = status;
    if (source) where.source = source;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true, variant: true } },
        packagingUsages: { include: { material: true } },
        batchOrders: { include: { batch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
protectedRouter.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: true, variant: true } },
        packagingUsages: { include: { material: true } },
        batchOrders: { include: { batch: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders  — manual entry by operator
protectedRouter.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, deliveryAddress, notes, internalNotes, items } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ error: 'Name, phone, and address are required' });
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes ? notes.trim() : null,
        internalNotes: internalNotes ? internalNotes.trim() : null,
        status: 'PENDING',
        source: 'MANUAL',
        items: items && items.length > 0
          ? {
              create: items.map((item) => ({
                itemDesc: item.itemDesc,
                quantity: parseInt(item.quantity) || 1,
                productId: item.productId ? parseInt(item.productId) : null,
                variantId: item.variantId ? parseInt(item.variantId) : null,
                buyingPrice: item.buyingPrice ? parseFloat(item.buyingPrice) : null,
                sellingPrice: item.sellingPrice ? parseFloat(item.sellingPrice) : null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
protectedRouter.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { items: true },
    });
    res.json(order);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id
protectedRouter.put('/:id', async (req, res) => {
  try {
    const { customerName, customerPhone, deliveryAddress, notes, internalNotes } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(deliveryAddress !== undefined && { deliveryAddress }),
        ...(notes !== undefined && { notes }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
      include: { items: true },
    });
    res.json(order);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = { publicRouter, protectedRouter };
