import { prisma } from '@/lib/prisma';
import { ClientsManagerView } from './ClientsManagerView';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <ClientsManagerView initialClients={clients} />
    </div>
  );
}
