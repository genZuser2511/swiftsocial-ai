const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    console.log("Updating Starter plan...");
    const { error: err1 } = await supabase
      .from('subscription_plans')
      .update({ price_annual_micro: 95990000000 }) // 95,990 * 1M
      .eq('name', 'Starter');
    if (err1) throw err1;

    console.log("Updating Growth plan...");
    const { error: err2 } = await supabase
      .from('subscription_plans')
      .update({ price_annual_micro: 239990000000 }) // 239,990 * 1M
      .eq('name', 'Growth');
    if (err2) throw err2;

    console.log("Successfully updated database prices for a strict 20% discount.");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
