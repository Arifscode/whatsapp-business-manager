const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    const where = {};
    if (category) where.category = category;
    if (active !== undefined) where.isActive = active === 'true';

    const products = await prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    // Add margin % to each product
    const withMargin = products.map((p) => ({
      ...p,
      marginPercent: p.sellingPrice > 0
        ? Math.round(((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100)
        : 0,
    }));

    res.json(withMargin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { variants: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({
      ...product,
      marginPercent: product.sellingPrice > 0
        ? Math.round(((product.sellingPrice - product.buyingPrice) / product.sellingPrice) * 100)
        : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const {
      name, category, description, buyingPrice, sellingPrice,
      stockQty, imageUrl, isUnique, variants,
    } = req.body;

    if (!name || !category || buyingPrice == null || sellingPrice == null) {
      return res.status(400).json({ error: 'name, category, buyingPrice, sellingPrice are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description: description || null,
        buyingPrice: parseFloat(buyingPrice),
        sellingPrice: parseFloat(sellingPrice),
        stockQty: parseInt(stockQty) || 0,
        imageUrl: imageUrl || null,
        isUnique: !!isUnique,
        variants: variants && variants.length > 0
          ? {
              create: variants.map((v) => ({
                name: v.name,
                stockQty: parseInt(v.stockQty) || 0,
                imageUrl: v.imageUrl || null,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name, category, description, buyingPrice, sellingPrice,
      stockQty, imageUrl, isUnique, isActive,
    } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(buyingPrice !== undefined && { buyingPrice: parseFloat(buyingPrice) }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) }),
        ...(stockQty !== undefined && { stockQty: parseInt(stockQty) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isUnique !== undefined && { isUnique: !!isUnique }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
      include: { variants: true },
    });

    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/variants
router.post('/:id/variants', async (req, res) => {
  try {
    const { name, stockQty, imageUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Variant name is required' });

    const variant = await prisma.productVariant.create({
      data: {
        productId: parseInt(req.params.id),
        name,
        stockQty: parseInt(stockQty) || 0,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/variants/:variantId
router.put('/variants/:variantId', async (req, res) => {
  try {
    const { name, stockQty, imageUrl } = req.body;
    const variant = await prisma.productVariant.update({
      where: { id: parseInt(req.params.variantId) },
      data: {
        ...(name !== undefined && { name }),
        ...(stockQty !== undefined && { stockQty: parseInt(stockQty) }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
