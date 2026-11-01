const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/packaging
router.get('/', async (req, res) => {
  try {
    const materials = await prisma.packagingMaterial.findMany({
      include: { purchases: { orderBy: { purchasedAt: 'desc' }, take: 5 } },
      orderBy: { name: 'asc' },
    });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/packaging/:id
router.get('/:id', async (req, res) => {
  try {
    const material = await prisma.packagingMaterial.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { purchases: { orderBy: { purchasedAt: 'desc' } } },
    });
    if (!material) return res.status(404).json({ error: 'Packaging material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packaging  — create new material
router.post('/', async (req, res) => {
  try {
    const { name, qtyPurchased, totalCost } = req.body;
    if (!name || qtyPurchased == null || totalCost == null) {
      return res.status(400).json({ error: 'name, qtyPurchased, and totalCost are required' });
    }

    const perUnitCost = parseFloat(totalCost) / parseInt(qtyPurchased);

    const material = await prisma.packagingMaterial.create({
      data: {
        name,
        currentStock: parseInt(qtyPurchased),
        perUnitCost,
        purchases: {
          create: {
            qtyPurchased: parseInt(qtyPurchased),
            totalCost: parseFloat(totalCost),
            perUnitCost,
          },
        },
      },
      include: { purchases: true },
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packaging/:id/stock  — restock
router.post('/:id/stock', async (req, res) => {
  try {
    const { qtyPurchased, totalCost } = req.body;
    if (qtyPurchased == null || totalCost == null) {
      return res.status(400).json({ error: 'qtyPurchased and totalCost are required' });
    }

    const id = parseInt(req.params.id);
    const existing = await prisma.packagingMaterial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Packaging material not found' });

    const newQty = parseInt(qtyPurchased);
    const newCost = parseFloat(totalCost);
    const newPerUnit = newCost / newQty;
    const totalStock = existing.currentStock + newQty;

    // Weighted average blended cost
    const blendedCost = totalStock > 0
      ? (existing.currentStock * existing.perUnitCost + newQty * newPerUnit) / totalStock
      : newPerUnit;

    const [purchase, material] = await prisma.$transaction([
      prisma.packagingPurchase.create({
        data: {
          materialId: id,
          qtyPurchased: newQty,
          totalCost: newCost,
          perUnitCost: newPerUnit,
        },
      }),
      prisma.packagingMaterial.update({
        where: { id },
        data: { currentStock: totalStock, perUnitCost: blendedCost },
      }),
    ]);

    res.json({ material, purchase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packaging/use  — assign packaging to an order
router.post('/use', async (req, res) => {
  try {
    const { materialId, orderId, qtyUsed } = req.body;
    if (!materialId || !orderId || !qtyUsed) {
      return res.status(400).json({ error: 'materialId, orderId, and qtyUsed are required' });
    }

    const material = await prisma.packagingMaterial.findUnique({
      where: { id: parseInt(materialId) },
    });
    if (!material) return res.status(404).json({ error: 'Packaging material not found' });
    if (material.currentStock < parseInt(qtyUsed)) {
      return res.status(400).json({ error: `Not enough stock. Available: ${material.currentStock}` });
    }

    const totalCost = material.perUnitCost * parseInt(qtyUsed);

    const [usage] = await prisma.$transaction([
      prisma.packagingUsage.create({
        data: {
          materialId: parseInt(materialId),
          orderId: parseInt(orderId),
          qtyUsed: parseInt(qtyUsed),
          costPerUnit: material.perUnitCost,
          totalCost,
        },
      }),
      prisma.packagingMaterial.update({
        where: { id: parseInt(materialId) },
        data: { currentStock: material.currentStock - parseInt(qtyUsed) },
      }),
    ]);

    res.status(201).json(usage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
