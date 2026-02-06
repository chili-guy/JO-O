/**
 * Garante que o admin padrão existe e a senha está correta.
 * Uso: node server/scripts/ensure-admin.js
 * (Execute na raiz do projeto.)
 */
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, setAdminByEmail, updatePasswordByEmail } from "../db.js";

const EMAIL = "admin@admin.com";
const PASSWORD = "admin123";

const hash = await bcrypt.hash(PASSWORD, 10);
const existing = await findUserByEmail(EMAIL);

if (existing) {
  await updatePasswordByEmail(EMAIL, hash);
  await setAdminByEmail(EMAIL);
  console.log(`Senha do admin atualizada: ${EMAIL}`);
} else {
  await createUser(EMAIL, hash, "per_story", true);
  console.log(`Admin criado: ${EMAIL} / ${PASSWORD}`);
}
