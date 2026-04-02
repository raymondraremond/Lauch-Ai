import fs from 'fs';

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
  const unprefixedKey = key.replace('VITE_', '');
  const fallbackValue = process.env[unprefixedKey];

  if (value || fallbackValue) {
    if (value) {
      console.log(`✅ [FOUND] ${key} (${value.length} characters)`);
    } else {
      console.log(`✅ [COMPATIBILITY] Using ${unprefixedKey} as fallback for ${key} (${fallbackValue.length} characters)`);
    }
    
    const actualValue = value || fallbackValue;
    if (actualValue.includes(' ')) {
      console.warn(`⚠️ [WARNING] Value contains spaces! This will break connection.`);
    }
    if (actualValue.startsWith('"') || actualValue.endsWith('"') || actualValue.startsWith("'") || actualValue.endsWith("'")) {
      console.warn(`⚠️ [WARNING] Value is wrapped in quotes! Vercel UI shouldn't have quotes.`);
    }
  } else {
    console.error(`❌ [MISSING] ${key} (and no unprefixed ${unprefixedKey} found)`);
    
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
  const isCI = process.env.VERCEL === '1' || process.env.CI === 'true';
  const hasEnvFile = fs.existsSync('.env');

  if (isCI) {
    console.error(`❌ ${missing} REQUIRED KEYS ARE MISSING. FAILING BUILD.`);
    console.error('ACTION REQUIRED: Add these keys in Vercel > Project Settings > Environment Variables.');
    process.exit(1); 
  } else if (hasEnvFile) {
    console.log(`⚠️ [LOCAL NOTICE] ${missing} keys missing from shell, but .env exists. Vite will load them automatically.`);
    console.log('✅ PASSING LOCAL AUDIT');
  } else {
    console.error(`❌ ${missing} REQUIRED KEYS ARE MISSING AND NO .ENV FILE FOUND.`);
    process.exit(1);
  }
}
console.log('--- AUDIT COMPLETE ---');
