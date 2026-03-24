type StatusCardProps = {
  title: string;
  description: string;
  status: string;
};

export function StatusCard({ title, description, status }: StatusCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 text-sm font-medium text-slate-500">{title}</div>
      <div className="mb-3 text-sm text-slate-700">{description}</div>
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
        {status}
      </span>
    </article>
  );
}
