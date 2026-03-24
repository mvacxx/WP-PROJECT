import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ProjectActions } from './project-actions';

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'provisioning') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const [project, installations, jobs, logs] = await Promise.all([
      api.getProject(id),
      api.listProjectInstallations(id),
      api.listContentJobs(id),
      api.listSystemLogs(id)
    ]);

    return (
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-slate-600">{project.domain}</p>
          </div>
          <Badge label={project.status} tone={statusTone(project.status)} />
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Nicho</p>
            <p className="mt-1 font-semibold">{project.niche}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Idioma</p>
            <p className="mt-1 font-semibold">{project.language}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Conexão WordPress</p>
            <p className="mt-1 font-semibold">{project.wordpressConnection}</p>
          </article>
        </section>

        <ProjectActions projectId={project.id} firstInstallationId={installations[0]?.id} />

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Instalações WordPress</h2>
            {installations.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma instalação registrada.</p>
            ) : (
              <ul className="space-y-3">
                {installations.map((installation) => (
                  <li key={installation.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{installation.method}</span>
                      <Badge label={installation.status} tone={statusTone(installation.status)} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{installation.wpSiteUrl ?? 'URL não configurada'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Jobs de conteúdo</h2>
            {jobs.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum job criado.</p>
            ) : (
              <ul className="space-y-3">
                {jobs.map((job) => (
                  <li key={job.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{job.title}</p>
                      <Badge label={job.status} tone={statusTone(job.status)} />
                    </div>
                    <p className="text-xs text-slate-500">Keyword: {job.keyword}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Logs principais</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">Sem logs para este projeto.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li key={log.id} className="rounded-md border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{log.source}</span>
                    <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-700">{log.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/projects" className="inline-block text-sm text-blue-600 hover:underline">
          ← Voltar para projetos
        </Link>
      </main>
    );
  } catch {
    notFound();
  }
}
