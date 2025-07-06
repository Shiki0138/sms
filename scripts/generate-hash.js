// パスワードハッシュ生成スクリプト
const bcrypt = require('bcryptjs');

const password = 'TestUser2024!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
});