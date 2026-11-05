import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });
process.env.TZ ||= 'America/Sao_Paulo';
export function segredo() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('substitua_')) throw new Error('Configure JWT_SECRET com um segredo aleatório de pelo menos 32 caracteres em backend/.env.');
  return process.env.JWT_SECRET;
}
