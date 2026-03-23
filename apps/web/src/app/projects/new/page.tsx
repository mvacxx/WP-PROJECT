import { NewProjectForm } from './new-project-form';

export default function NewProjectPage() {
  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Novo projeto</h1>
        <p className="text-sm text-slate-600">Cadastre um novo site para provisionamento WordPress.</p>
      </div>

      <NewProjectForm />
    </main>
  );
}
