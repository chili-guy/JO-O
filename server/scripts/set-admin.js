/**
 * Define um usuário como administrador pelo email.
 * Uso: node server/scripts/set-admin.js email@exemplo.com
 * (Execute a partir da raiz do projeto.)
 */
import { setAdminByEmail } from "../db.js";

const email = process.argv[2];
if (!email) {
  console.error("Uso: node server/scripts/set-admin.js <email>");
  process.exit(1);
}

const ok = await setAdminByEmail(email);
if (ok) console.log(`Administrador definido: ${email}`);
else console.error(`Usuário não encontrado: ${email}`);
