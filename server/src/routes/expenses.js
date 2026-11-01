const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, expenseDate } = req.body;
    if (!description || amount == null) {
      return res.status(400).json({ error: 'description and amount are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category || 'Other',
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, category, expenseDate } = req.body;
    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category !== undefined && { category }),
        ...(expenseDate !== undefined && { expenseDate: new Date(expenseDate) }),
      },
    });
    res.json(expense);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Expense not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Expense not found' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
