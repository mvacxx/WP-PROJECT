import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'provisioning') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}

export default async function ProjectsPage() {
  let data: Awaited<ReturnType<typeof api.listProjects>> = { data: [], total: 0 };
  let hasError = false;

  try {
    data = await api.listProjects();
  } catch {
    hasError = true;
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-sm text-slate-600">Lista de sites e status operacional.</p>
        </div>
        <Link href="/projects/new">
          <Button>Novo projeto</Button>
        </Link>
      </div>

      {hasError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Não foi possível carregar os projetos. Verifique a API.
        </div>
      ) : data.data.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Nenhum projeto cadastrado.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Domínio</th>
                <th className="px-4 py-3">Nicho</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((project) => (
                <tr key={project.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3">{project.domain}</td>
                  <td className="px-4 py-3">{project.niche}</td>
                  <td className="px-4 py-3">
                    <Badge label={project.status} tone={statusTone(project.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
