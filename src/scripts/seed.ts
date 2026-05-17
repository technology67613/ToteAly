import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const products = [
  {
    sku: 'TOTE-CANVAS-001',
    title: 'Everyday Canvas Tote',
    price: 599,
    description: 'A clean cotton canvas tote for daily errands.',
    category: 'Plain Totes',
    images: ['https://images.unsplash.com/photo-1591337676887-a217a6970c8a?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: true,
    stock: 50
  },
  {
    sku: 'TOTE-PREM-002',
    title: 'Premium Structured Tote',
    price: 1199,
    description: 'A sturdier statement tote with a premium finish.',
    category: 'Premium',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: true,
    stock: 30
  },
  {
    sku: 'TOTE-MINI-003',
    title: 'Mini Aesthetic Tote',
    description: 'Perfect for light travel and daily essentials.',
    price: 149.00,
    category: 'Plain Totes',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1591337676887-a217a6970c8a?w=800'],
    is_customizable: true
  },
  {
    sku: 'TOTE-LARGE-004',
    title: 'Large Canvas Shopper',
    description: 'Heavy-duty canvas for your biggest hauls.',
    price: 299.00,
    category: 'Premium',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
    is_customizable: false
  },
  {
    sku: 'TOTE-PINK-005',
    title: 'Pastel Pink Bag',
    description: 'Soft aesthetic pink for a subtle statement.',
    price: 179.00,
    category: 'Plain Totes',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
    is_customizable: true
  },
  {
    sku: 'TOTE-NAVY-006',
    title: 'Midnight Navy Tote',
    description: 'Deep blue canvas with reinforced stitching.',
    price: 199.00,
    category: 'Premium',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?w=800'],
    is_customizable: true
  },
  {
    sku: 'TOTE-CREAM-007',
    title: 'Vintage Cream Tote',
    description: 'Classic off-white look for that retro vibe.',
    price: 159.00,
    category: 'Plain Totes',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800'],
    is_customizable: true
  },
  {
    sku: 'HAMP-GIFT-008',
    title: 'The Gifting Hamper',
    description: 'A complete set of 3 mini totes for gifting.',
    price: 599.00,
    category: 'Hampers',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800'],
    is_customizable: true
  }
];

async function seed() {
  console.log('🚀 Starting Seeding Process...');

  // 1. Seed Products
  console.log('📦 Seeding products...');
  const { data: seededProducts, error: pError } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'sku' })
    .select();

  if (pError) {
    console.error('❌ Failed to seed products:', pError.message);
    return;
  }
  console.log(`✅ Seeded ${seededProducts.length} products`);

  // 2. Seed Mock Orders
  console.log('🛒 Seeding mock orders...');
  for (let i = 1; i <= 15; i++) {
    const randomProduct = seededProducts[Math.floor(Math.random() * seededProducts.length)];
    const qty = Math.floor(Math.random() * 3) + 1;
    
    const { data: order, error: oError } = await supabase
      .from('orders')
      .insert({
        total_amount: randomProduct.price * qty,
        payment_status: i % 3 === 0 ? 'Pending' : 'Paid',
        status: i % 4 === 0 ? 'Shipped' : (i % 5 === 0 ? 'Delivered' : 'Processing'),
        shipping_details: {
          full_name: `Mock Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `98765432${i.toString().padStart(2, '0')}`,
          address: `${100 + i} Aesthetic Street`,
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (oError) {
      console.error(`❌ Failed to seed order ${i}:`, oError.message);
      continue;
    }

    // Seed Order Item
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: randomProduct.id,
      name: randomProduct.title,
      price: randomProduct.price,
      quantity: qty
    });
  }
  console.log('✅ Seeded 15 mock orders');

  // 3. Seed Reviews
  console.log('⭐️ Seeding reviews...');
  for (let i = 1; i <= 10; i++) {
    const randomProduct = seededProducts[Math.floor(Math.random() * seededProducts.length)];
    await supabase.from('reviews').insert({
      product_id: randomProduct.id,
      user_name: `Happy User ${i}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      comment: `Absolutely love the quality of this ${randomProduct.title}! Highly recommend.`,
      status: 'approved'
    });
  }
  console.log('✅ Seeded 10 reviews');

  // 4. Seed site_config settings
  console.log('⚙️ Seeding site_config...');
  const siteConfigSettings = [
    { key: 'site_name', value: 'Tote-ally Iconic', description: 'Store name' },
    { key: 'contact_email', value: 'toteallyiconic@gmail.com', description: 'Public contact email' },
    { key: 'whatsapp_number', value: '+91 98250 63143', description: 'WhatsApp number for shop support' },
    { key: 'shop_address', value: '123 Iconic Lane, Style District Mumbai, Maharashtra 400001 India', description: 'Headquarters or physical shop address' },
    { key: 'instagram_handle', value: 'tote_ally_iconic', description: 'Instagram handle' },
    { key: 'currency_symbol', value: '₹', description: 'Currency symbol' },
    { key: 'free_shipping_threshold', value: 999, description: 'Free shipping threshold amount' },
    { key: 'base_shipping_cost', value: 50, description: 'Flat shipping fee for orders below threshold' },
    { key: 'announcement_bar', value: 'Free Shipping on orders above ₹999!', description: 'Top announcement bar message' },
    { key: 'maintenance_mode', value: false, description: 'Maintenance mode toggle' },
    { key: 'logo_url', value: '', description: 'Master logo URL' }
  ];

  const { error: scError } = await supabase
    .from('site_config')
    .upsert(siteConfigSettings, { onConflict: 'key' });

  if (scError) {
    console.error('❌ Failed to seed site_config:', scError.message);
  } else {
    console.log('✅ Seeded site_config settings successfully');
  }

  console.log('✨ Seeding complete! Your dashboard is now fully populated.');
}

seed().catch(console.error);
