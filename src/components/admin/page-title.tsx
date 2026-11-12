export function AdminPageTitle({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-4xl text-primary-dark">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border hairline bg-white p-5 md:p-6 ${className}`}>
      {title && <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">{title}</h2>}
      {children}
    </section>
  );
}
