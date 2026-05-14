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
    id: 'plain-canvas-tote',
    title: 'Everyday Canvas Tote',
    price: 599,
    description: 'A clean cotton canvas tote for daily errands.',
    category: 'Plain Totes',
    images: ['https://images.unsplash.com/photo-1591337676887-a217a6970c8a?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: true,
    is_featured: true,
    stock: 50
  },
  {
    id: 'premium-structured-tote',
    title: 'Premium Structured Tote',
    price: 1199,
    description: 'A sturdier statement tote with a premium finish.',
    category: 'Premium',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: true,
    is_featured: true,
    stock: 30
  },
  {
    id: 'midnight-black-tote',
    title: 'Midnight Black Tote',
    price: 899,
    description: 'A bold black tote made for high-contrast prints.',
    category: 'Premium',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: true,
    is_featured: true,
    stock: 20
  },
  {
    id: 'gift-ready-hamper',
    title: 'Gift Ready Hamper',
    price: 1599,
    description: 'A curated tote gift set for bridesmaids.',
    category: 'Hampers',
    images: ['https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?auto=format&fit=crop&w=800&h=1000'],
    is_customizable: false,
    is_featured: true,
    stock: 10
  }
];

async function seed() {
  console.log('🚀 Seeding products...');
  
  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Failed to seed ${product.title}:`, error.message);
    } else {
      console.log(`✅ Seeded ${product.title}`);
    }
  }
  
  console.log('✨ Seeding complete!');
}

seed().catch(console.error);
