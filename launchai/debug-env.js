console.log('--- 🛡️ SUPABASE BUILD-TIME AUDIT ---');

const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const commonMisnames = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'REACT_APP_SUPABASE_URL'];

let missing = 0;

// Log all available keys (sanitized) to help diagnose naming issues
const allKeys = Object.keys(process.env).filter(k => 
  k.includes('SUPABASE') || k.includes('VITE') || k.includes('URL') || k.includes('KEY')
).sort();
console.log('Available Environment Keys:', allKeys.join(', '));

requiredKeys.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ [FOUND] ${key} (${value.length} characters)`);
    if (value.includes(' ')) {
      console.warn(`⚠️ [WARNING] ${key} contains spaces! This might break Vite.`);
    }
  } else {
    console.error(`❌ [MISSING] ${key}`);
    
    // Check if it's misnamed
    const findMisname = commonMisnames.find(mk => process.env[mk]);
    if (findMisname) {
      console.error(`💡 [HINT] Found ${findMisname} instead. Vite requires the "VITE_" prefix.`);
    }
    missing++;
  }
});

if (missing === 0) {
  console.log('✅ ALL KEYS PRESENT IN ENVIRONMENT');
} else {
  console.error(`❌ ${missing} REQUIRED KEYS ARE MISSING. FAILING BUILD.`);
  console.error('ACTION REQUIRED: Add these keys in Vercel > Project Settings > Environment Variables.');
  process.exit(1); // Fail the build immediately
}
console.log('--- AUDIT COMPLETE ---');
