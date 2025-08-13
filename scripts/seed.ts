#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

const sampleNeeds = [
  // Personal needs
  { title: "個人ブログのデザイン改善", scale: 'personal' as const },
  { title: "家族旅行の写真整理", scale: 'personal' as const },
  { title: "自宅のWiFi環境改善", scale: 'personal' as const },
  
  // Community needs
  { title: "地域イベントのWebサイト制作", scale: 'community' as const, macro_fee_hint: "上限50万円", macro_use_freq: "年2回のイベント", macro_area_hint: "高知県内" },
  { title: "商店街のデジタル化支援", scale: 'community' as const, macro_fee_hint: "月額5万円程度", macro_use_freq: "継続的な運営", macro_area_hint: "高知市中心部" },
  { title: "地域コミュニティのSNS運営", scale: 'community' as const, macro_fee_hint: "初期費用30万円", macro_use_freq: "週1回の更新", macro_area_hint: "四国地方" },
];

const sampleVendors = [
  "テックソリューションズ",
  "デジタルクリエイターズ",
  "システムインテグレーター",
  "クラウドスペシャリスト",
  "セキュリティエキスパート",
  "デザインスタジオ",
];

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Create sample needs
    const needs = [];
    for (let i = 0; i < sampleNeeds.length; i++) {
      const needData = sampleNeeds[i];
      const need = {
        title: needData.title,
        scale: needData.scale,
        macro_fee_hint: needData.scale === 'community' ? needData.macro_fee_hint : null,
        macro_use_freq: needData.scale === 'community' ? needData.macro_use_freq : null,
        macro_area_hint: needData.scale === 'community' ? needData.macro_area_hint : null,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      };
      
      // Use upsert to avoid duplicates
      const { data, error } = await supabase
        .from('needs')
        .upsert(need as any, { onConflict: 'title' })
        .select('id')
        .single();
      
      if (error) {
        console.error(`Failed to create need "${need.title}":`, error);
        continue;
      }
      
      needs.push(data);
      console.log(`✅ Created/Updated need: ${need.title} (${need.scale})`);
    }

    // Create sample offers for each need
    for (const need of needs) {
      const offerCount = Math.floor(Math.random() * 4) + 3; // 3-6 offers
      const usedVendors = new Set<string>();
      
      for (let i = 0; i < offerCount; i++) {
        // Ensure unique vendors per need
        let vendor;
        do {
          vendor = sampleVendors[Math.floor(Math.random() * sampleVendors.length)];
        } while (usedVendors.has(vendor));
        usedVendors.add(vendor);
        
        const amount = Math.floor(Math.random() * 900000) + 100000; // 100k-1M yen
        const offer = {
          need_id: need.id,
          vendor_name: vendor,
          amount,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 7 days
        };
        
        const { error } = await supabase
          .from('offers')
          .insert(offer as any);
        
        if (error) {
          console.error(`Failed to create offer for need ${need.id}:`, error);
          continue;
        }
        
        console.log(`  ✅ Created offer: ${vendor} - ¥${amount.toLocaleString()}`);
      }
    }

    console.log('🎉 Seed completed successfully!');
    console.log(`Created ${needs.length} needs with ${needs.length * 4.5} offers on average`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
