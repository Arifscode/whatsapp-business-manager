/**
 * Run this to generate a bcrypt hash for your operator password.
 * Usage: node scripts/generate-hash.js yourpassword
 *
 * Copy the output and set it as OPERATOR_PASSWORD_HASH in your .env or Railway env vars.
 */
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/generate-hash.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nPassword hash (copy this to OPERATOR_PASSWORD_HASH):');
console.log(hash);
console.log('\nExample .env entry:');
console.log(`OPERATOR_PASSWORD_HASH=${hash}`);
