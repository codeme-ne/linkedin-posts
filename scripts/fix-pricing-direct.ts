import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Get environment variables directly
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPricing() {
  console.log('🔧 Fixing subscription pricing...\n');

  // First, check current subscriptions
  const { data: beforeData, error: checkError } = await supabase
    .from('subscriptions')
    .select('id, user_id, interval, amount, currency, is_active')
    .eq('is_active', true);

  if (checkError) {
    console.error('❌ Error checking subscriptions:', checkError);
    return;
  }

  console.log('📊 Current active subscriptions:');
  beforeData?.forEach(sub => {
    console.log(`  - ${sub.interval}: ${sub.amount ? sub.amount/100 : 'null'}€ (${sub.user_id.substring(0, 8)}...)`);
  });

  // Fix monthly subscriptions
  const { error: monthlyError } = await supabase
    .from('subscriptions')
    .update({
      amount: 2900,  // 29€
      currency: 'eur',
      updated_at: new Date().toISOString()
    })
    .eq('interval', 'monthly')
    .or('amount.eq.9900,amount.is.null,amount.neq.2900');

  if (monthlyError) {
    console.error('❌ Error updating monthly subscriptions:', monthlyError);
  } else {
    console.log('✅ Updated monthly subscriptions to 29€');
  }

  // Fix yearly subscriptions
  const { error: yearlyError } = await supabase
    .from('subscriptions')
    .update({
      amount: 29900,  // 299€
      currency: 'eur',
      updated_at: new Date().toISOString()
    })
    .eq('interval', 'yearly')
    .or('amount.neq.29900,amount.is.null');

  if (yearlyError) {
    console.error('❌ Error updating yearly subscriptions:', yearlyError);
  } else {
    console.log('✅ Updated yearly subscriptions to 299€');
  }

  // Verify the updates
  const { data: afterData, error: verifyError } = await supabase
    .from('subscriptions')
    .select('id, user_id, interval, amount, currency, is_active')
    .eq('is_active', true);

  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError);
    return;
  }

  console.log('\n📊 Updated active subscriptions:');
  afterData?.forEach(sub => {
    console.log(`  - ${sub.interval}: ${sub.amount ? sub.amount/100 : 'null'}€ (${sub.user_id.substring(0, 8)}...)`);
  });

  console.log('\n✨ Pricing fix complete!');
}

fixPricing().catch(console.error);