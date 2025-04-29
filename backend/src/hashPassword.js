import bcrypt from 'bcrypt';

const password = '123456';

(async () => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
})();