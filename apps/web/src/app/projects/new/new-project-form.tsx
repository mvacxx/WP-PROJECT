'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const initialForm = {
  name: '',
  domain: '',
  niche: '',
  language: 'pt-BR',
  desiredTheme: '',
  initialPages: 'About,Contact,Privacy Policy,Terms',
  defaultPlugins: 'seo-plugin,security-plugin,cache-plugin',
  installationType: 'vps'
};

export function NewProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
      const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

      const response = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminApiKey ? { 'x-admin-api-key': adminApiKey } : {})
        },
        body: JSON.stringify({
          name: form.name,
          domain: form.domain,
          niche: form.niche,
          language: form.language,
          desiredTheme: form.desiredTheme || undefined,
          initialPages: form.initialPages
            .split(',')
            .map((page) => page.trim())
            .filter(Boolean),
          defaultPlugins: form.defaultPlugins
            .split(',')
            .map((plugin) => plugin.trim())
            .filter(Boolean),
          installationType: form.installationType
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Falha ao criar projeto');
      }

      const project = (await response.json()) as { id: string };
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nome do projeto</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Domínio</label>
          <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Nicho</label>
          <Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Idioma</label>
          <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tema desejado</label>
          <Input value={form.desiredTheme} onChange={(e) => setForm({ ...form, desiredTheme: e.target.value })} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de instalação</label>
          <Select
            value={form.installationType}
            onChange={(e) => setForm({ ...form, installationType: e.target.value })}
          >
            <option value="vps">VPS</option>
            <option value="shared_hosting">Shared Hosting</option>
            <option value="cloud">Cloud</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Páginas iniciais (separadas por vírgula)</label>
        <Input value={form.initialPages} onChange={(e) => setForm({ ...form, initialPages: e.target.value })} required />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Plugins padrão (separados por vírgula)</label>
        <Input
          value={form.defaultPlugins}
          onChange={(e) => setForm({ ...form, defaultPlugins: e.target.value })}
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar projeto'}
        </Button>
      </div>
    </form>
  );
}
