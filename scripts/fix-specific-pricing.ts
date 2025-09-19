import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Get environment variables directly
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSpecificPricing() {
  console.log('🔧 Fixing subscription pricing issues...\n');

  // First, get ALL subscriptions to understand the data
  const { data: allSubs, error: allError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching subscriptions:', allError);
    return;
  }

  console.log('📊 All subscriptions in database:');
  console.log('================================');
  allSubs?.forEach(sub => {
    console.log(`ID: ${sub.id}`);
    console.log(`  User: ${sub.user_id?.substring(0, 8)}...`);
    console.log(`  Interval: ${sub.interval || 'NULL'}`);
    console.log(`  Amount: ${sub.amount ? sub.amount/100 + '€' : 'NULL'}`);
    console.log(`  Currency: ${sub.currency || 'NULL'}`);
    console.log(`  Active: ${sub.is_active}`);
    console.log(`  Status: ${sub.status}`);
    console.log(`  Stripe Sub ID: ${sub.stripe_subscription_id || 'NULL'}`);
    console.log('---');
  });

  // Fix subscriptions that have amounts of 9900 (99€) which should be 2900 (29€) for monthly
  console.log('\n🔧 Fixing subscriptions with 99€ amount...');
  const { data: wrongPriced, error: findError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('amount', 9900);

  if (findError) {
    console.error('❌ Error finding wrong-priced subscriptions:', findError);
  } else if (wrongPriced && wrongPriced.length > 0) {
    console.log(`Found ${wrongPriced.length} subscription(s) with 99€ amount`);

    for (const sub of wrongPriced) {
      // Determine correct amount based on interval
      let correctAmount = 2900; // Default to monthly (29€)

      if (sub.interval === 'yearly') {
        correctAmount = 29900; // 299€ for yearly
      } else if (sub.interval === 'lifetime') {
        console.log(`⚠️ Skipping lifetime subscription ${sub.id} - keeping at 99€`);
        continue; // Skip lifetime subscriptions
      } else if (!sub.interval || sub.interval === 'monthly') {
        correctAmount = 2900; // 29€ for monthly or null interval (assume monthly)
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          amount: correctAmount,
          currency: 'eur',
          interval: sub.interval || 'monthly', // Set interval to monthly if null
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error(`❌ Error updating subscription ${sub.id}:`, updateError);
      } else {
        console.log(`✅ Updated subscription ${sub.id}: 99€ → ${correctAmount/100}€ (${sub.interval || 'monthly'})`);
      }
    }
  } else {
    console.log('No subscriptions found with 99€ amount');
  }

  // Fix any subscriptions with null amounts but defined intervals
  console.log('\n🔧 Fixing subscriptions with NULL amounts...');
  const { data: nullAmounts, error: nullError } = await supabase
    .from('subscriptions')
    .select('*')
    .is('amount', null)
    .not('interval', 'is', null);

  if (nullError) {
    console.error('❌ Error finding null amount subscriptions:', nullError);
  } else if (nullAmounts && nullAmounts.length > 0) {
    console.log(`Found ${nullAmounts.length} subscription(s) with NULL amount`);

    for (const sub of nullAmounts) {
      const correctAmount = sub.interval === 'yearly' ? 29900 : 2900;

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          amount: correctAmount,
          currency: 'eur',
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error(`❌ Error updating subscription ${sub.id}:`, updateError);
      } else {
        console.log(`✅ Updated subscription ${sub.id}: NULL → ${correctAmount/100}€ (${sub.interval})`);
      }
    }
  } else {
    console.log('No subscriptions found with NULL amount and defined interval');
  }

  // Final verification
  console.log('\n📊 Final subscription state:');
  console.log('============================');
  const { data: finalData, error: finalError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_active', true);

  if (finalError) {
    console.error('❌ Error fetching final state:', finalError);
    return;
  }

  finalData?.forEach(sub => {
    const amountDisplay = sub.amount ? `${sub.amount/100}€` : 'NULL';
    const intervalDisplay = sub.interval || 'NULL';
    console.log(`✓ ${intervalDisplay}: ${amountDisplay} (User: ${sub.user_id?.substring(0, 8)}...)`);
  });

  console.log('\n✨ Pricing fix complete!');
  console.log('💡 Note: Lifetime subscriptions were preserved at their original price.');
  console.log('📝 Refresh the Settings page to see the updated prices.');
}

fixSpecificPricing().catch(console.error);