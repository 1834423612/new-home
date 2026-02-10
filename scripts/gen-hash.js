import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("123456", 12);
console.log("HASH:", hash);
