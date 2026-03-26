import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'provisioning') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}

export default async function DashboardPage() {
  let total = 0;
  let projects = [] as Awaited<ReturnType<typeof api.listProjects>>['data'];

  try {
    const response = await api.listProjects();
    total = response.total;
    projects = response.data.slice(0, 5);
  } catch {
    // Keep dashboard resilient when API is offline.
  }

  return (
    <main className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gerencie provisionamento de sites WordPress, jobs de conteúdo e logs operacionais.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Projetos cadastrados</p>
            <p className="mt-1 text-3xl font-bold">{total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Integração WordPress</p>
            <p className="mt-1 text-lg font-semibold">Camada pronta (fase 5 em seguida)</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Filas de conteúdo</p>
            <p className="mt-1 text-lg font-semibold">BullMQ ativo no backend</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projetos recentes</h2>
          <Link href="/projects/new">
            <Button>Novo projeto</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum projeto encontrado. Crie o primeiro projeto.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-sm text-slate-600">{project.domain}</p>
                  </div>
                  <Badge label={project.status} tone={statusTone(project.status)} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
