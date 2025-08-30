const { execSync } = require('child_process');

console.log('🔍 Checking deployment readiness...');

// Check if all required environment variables are set
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('✅ Deployment readiness check passed!');