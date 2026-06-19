const crypto = require('crypto');

function encryptNative(text, secret) {
  const key = Buffer.from(secret, 'utf8');
  const iv = Buffer.from(secret, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

const secret = 'p&aNDm6&whRD#HdL';
console.log('Encrypted "admin":', encryptNative('admin', secret));
console.log('Encrypted "admin123":', encryptNative('admin123', secret));
console.log('Encrypted "user123":', encryptNative('user123', secret));
