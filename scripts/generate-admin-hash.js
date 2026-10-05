#!/usr/bin/env node
// Run with: npm run generate-admin-hash
// (or: npm run generate-admin-hash -- "yourPassword" to skip the prompt)
//
// Hashes an admin password with Node's built-in scrypt (no dependency
// needed) and prints the value to put in ADMIN_PASSWORD_HASH. The plain
// password is never stored anywhere — only this hash is.
//
// Note: the interactive prompt below does not mask input as you type
// (Node's built-in readline doesn't support that without extra work). If
// that matters to you, run it in a private terminal, or use the
// command-line argument form and clear your shell history afterwards.
import crypto from 'node:crypto';
import readline from 'node:readline';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function run(password) {
  if (!password || password.trim().length < 8) {
    console.error('\nकृपया कम से कम 8 अक्षरों का मज़बूत पासवर्ड चुनें।');
    console.error('Please choose a password of at least 8 characters.\n');
    process.exitCode = 1;
    return;
  }
  const hash = hashPassword(password.trim());
  console.log('\nAdd this to your .env file (or your hosting provider\u2019s environment variables):\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
}

const argPassword = process.argv[2];
if (argPassword) {
  run(argPassword);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Choose an admin password (min 8 characters): ', (answer) => {
    rl.close();
    run(answer);
  });
}
