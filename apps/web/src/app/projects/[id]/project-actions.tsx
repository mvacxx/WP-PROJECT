'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type ProjectActionsProps = {
  projectId: string;
  firstInstallationId?: string;
};

export function ProjectActions({ projectId, firstInstallationId }: ProjectActionsProps) {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

  const [jobTitle, setJobTitle] = useState('');
  const [jobKeyword, setJobKeyword] = useState('');
  const [provider, setProvider] = useState('seowriting');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await action();
      setMessage(successMessage);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function triggerProvisioning() {
    await runAction(async () => {
      const response = await fetch(`${apiUrl}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminApiKey ? { 'x-admin-api-key': adminApiKey } : {})
        },
        body: JSON.stringify({ status: 'provisioning' })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (firstInstallationId) {
        const installationResponse = await fetch(
          `${apiUrl}/wordpress-installations/${firstInstallationId}/status/running`,
          {
            method: 'PATCH',
            headers: {
              ...(adminApiKey ? { 'x-admin-api-key': adminApiKey } : {})
            }
          }
        );

        if (!installationResponse.ok) {
          throw new Error(await installationResponse.text());
        }
      }
    }, 'Provisionamento acionado com sucesso.');
  }

  async function createDefaultInstallation() {
    await runAction(async () => {
      const response = await fetch(`${apiUrl}/wordpress-installations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminApiKey ? { 'x-admin-api-key': adminApiKey } : {})
        },
        body: JSON.stringify({
          projectId,
          method: 'ssh_wp_cli',
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    }, 'Instalação WordPress registrada.');
  }

  async function createContentJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await runAction(async () => {
      const response = await fetch(`${apiUrl}/content-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminApiKey ? { 'x-admin-api-key': adminApiKey } : {})
        },
        body: JSON.stringify({
          projectId,
          title: jobTitle,
          keyword: jobKeyword,
          provider
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setJobTitle('');
      setJobKeyword('');
    }, 'Job de conteúdo criado e enviado para fila.');
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Ações do projeto</h2>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={triggerProvisioning} disabled={loading}>
          Acionar provisionamento
        </Button>

        <Button type="button" variant="secondary" onClick={createDefaultInstallation} disabled={loading}>
          Registrar instalação WP
        </Button>
      </div>

      <form onSubmit={createContentJob} className="space-y-3 rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium">Criar job de conteúdo</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Título do artigo"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
          <Input
            placeholder="Keyword"
            value={jobKeyword}
            onChange={(e) => setJobKeyword(e.target.value)}
            required
          />
          <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="seowriting">SEOwriting</option>
            <option value="manual">Manual</option>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            Criar job
          </Button>
        </div>
      </form>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
