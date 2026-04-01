console.log('--- 🛡️ SUPABASE BUILD-TIME AUDIT ---');

const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
let missing = 0;

requiredKeys.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ [FOUND] ${key} (${value.length} characters)`);
    if (value.includes(' ')) {
      console.warn(`⚠️ [WARNING] ${key} contains spaces! This might break Vite.`);
    }
  } else {
    console.error(`❌ [MISSING] ${key}`);
    missing++;
  }
});

if (missing === 0) {
  console.log('✅ ALL KEYS PRESENT IN ENVIRONMENT');
} else {
  console.error(`❌ ${missing} KEYS ARE MISSING. BUILD MAY FAIL.`);
}
console.log('--- AUDIT COMPLETE ---');
