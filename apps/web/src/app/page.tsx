import { StatusCard } from '@/components/status-card';

const cards = [
  {
    title: 'Projetos',
    description: 'Cadastro e gestão de sites WordPress.',
    status: 'fase 2 iniciado'
  },
  {
    title: 'Provisionamento',
    description: 'Pipeline baseado em SSH/WP-CLI com fallback por strategy.',
    status: 'arquitetado'
  },
  {
    title: 'Conteúdo',
    description: 'Jobs com filas e integração desacoplada por ContentProvider.',
    status: 'planejado'
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl p-8">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">WP Automation SaaS</p>
        <h1 className="text-3xl font-bold text-slate-900">Painel interno de automação WordPress</h1>
        <p className="text-slate-600">
          MVP em construção com Next.js + NestJS + Prisma + BullMQ.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <StatusCard key={card.title} {...card} />
        ))}
      </section>
    </main>
  );
}
