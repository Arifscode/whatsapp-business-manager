const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Sample products
  const handbag = await prisma.product.create({
    data: {
      name: 'Classic Brown Handbag',
      category: 'Handbag',
      description: 'Stylish brown leather-look handbag, perfect for everyday use',
      buyingPrice: 850,
      sellingPrice: 1400,
      stockQty: 5,
      imageUrl: null,
      isUnique: false,
      variants: {
        create: [
          { name: 'Brown', stockQty: 3 },
          { name: 'Black', stockQty: 2 },
        ],
      },
    },
  });

  const bridalPurse = await prisma.product.create({
    data: {
      name: 'Golden Bridal Clutch',
      category: 'BridalPurse',
      description: 'Elegant gold embroidered clutch for bridal events',
      buyingPrice: 1200,
      sellingPrice: 2200,
      stockQty: 1,
      imageUrl: null,
      isUnique: true,
    },
  });

  const jewelry = await prisma.product.create({
    data: {
      name: 'Pearl Necklace Set',
      category: 'Jewelry',
      description: 'Artificial pearl necklace with matching earrings',
      buyingPrice: 450,
      sellingPrice: 900,
      stockQty: 8,
      imageUrl: null,
      isUnique: false,
      variants: {
        create: [
          { name: 'White Pearl', stockQty: 5 },
          { name: 'Pink Pearl', stockQty: 3 },
        ],
      },
    },
  });

  // Sample packaging materials
  await prisma.packagingMaterial.create({
    data: {
      name: 'Small Gift Bag',
      currentStock: 100,
      perUnitCost: 4,
      purchases: {
        create: {
          qtyPurchased: 100,
          totalCost: 400,
          perUnitCost: 4,
        },
      },
    },
  });

  await prisma.packagingMaterial.create({
    data: {
      name: 'Bubble Wrap Sheet',
      currentStock: 50,
      perUnitCost: 8,
      purchases: {
        create: {
          qtyPurchased: 50,
          totalCost: 400,
          perUnitCost: 8,
        },
      },
    },
  });

  // Sample orders
  const order1 = await prisma.order.create({
    data: {
      customerName: 'Sara Ahmed',
      customerPhone: '03001234567',
      deliveryAddress: 'House 12, Street 4, DHA Karachi',
      notes: 'Please wrap nicely, it\'s a gift',
      status: 'PENDING',
      source: 'FORM',
      items: {
        create: {
          itemDesc: 'Golden Bridal Clutch',
          quantity: 1,
          productId: bridalPurse.id,
          buyingPrice: 1200,
          sellingPrice: 2200,
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerName: 'Fatima Khan',
      customerPhone: '03123456789',
      deliveryAddress: 'Flat 5B, Gulshan-e-Iqbal, Karachi',
      status: 'CONFIRMED',
      source: 'MANUAL',
      internalNotes: 'Regular customer, give discount next time',
      items: {
        create: {
          itemDesc: 'Pearl Necklace Set - White',
          quantity: 2,
          productId: jewelry.id,
          buyingPrice: 450,
          sellingPrice: 900,
        },
      },
    },
  });

  // Sample expense
  await prisma.expense.create({
    data: {
      description: 'Purchased packaging bags and bubble wrap',
      amount: 800,
      category: 'Packaging',
    },
  });

  console.log('✅ Seed complete!');
  console.log(`   Products: ${handbag.name}, ${bridalPurse.name}, ${jewelry.name}`);
  console.log(`   Orders: ${order1.id} (${order1.status}), ${order2.id} (${order2.status})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
