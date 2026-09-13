import { PrismaClient } from './generated/prisma/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

async function main() {
  try {
    console.log('1. Creating adapter with url...');
    const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
    console.log('2. Adapter created:', typeof adapter);
    
    console.log('3. Creating PrismaClient...');
    const prisma = new PrismaClient({ adapter });
    console.log('4. PrismaClient created');
    
    console.log('5. Running query...');
    const users = await prisma.user.findMany();
    console.log('6. SUCCESS! Users found:', users.length);
  } catch (e: any) {
    console.error('ERROR:', e.message);
    console.error('Stack:', e.stack);
  }
}

main();
