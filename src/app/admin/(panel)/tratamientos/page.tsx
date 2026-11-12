import type { Metadata } from "next";
import { deleteTreatment } from "@/app/admin/actions";
import { TreatmentForm } from "@/app/admin/(panel)/tratamientos/treatment-form";
import { ConfirmButton } from "@/components/admin/form";
import { AdminPageTitle, Panel } from "@/components/admin/page-title";
import { treatmentCategories } from "@/data/treatments";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Tratamientos" };

export default async function TreatmentsAdminPage() {
  const treatments = await prisma.treatment.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <>
      <AdminPageTitle
        title="Tratamientos"
        description="Servicios que las clientas pueden reservar en línea. Los tratamientos inactivos no aparecen en la web."
      />

      <Panel title="Nuevo tratamiento" className="mb-8">
        <TreatmentForm />
      </Panel>

      <div className="space-y-8">
        {treatmentCategories.map((c) => {
          const list = treatments.filter((t) => t.category === c.category);
          return (
            <Panel key={c.category} title={`${c.label} (${list.length})`}>
              {list.length === 0 ? (
                <p className="text-sm text-muted">Sin tratamientos en esta categoría.</p>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {list.map((t) => (
                    <li key={t.id}>
                      <details className="group py-3">
                        <summary className="flex cursor-pointer list-none items-center gap-4 text-sm">
                          <span className={`size-2 rounded-full ${t.active ? "bg-[#3f6b4a]" : "bg-ink/20"}`} aria-label={t.active ? "Activo" : "Inactivo"} />
                          <span className="flex-1 font-medium">{t.name}</span>
                          <span className="text-muted">{t.durationMinutes} min</span>
                          <span className="text-xs text-muted">{t._count.bookings} reservas</span>
                          <span className="text-xs font-semibold text-primary group-open:hidden">Editar</span>
                          <span className="hidden text-xs font-semibold text-primary group-open:inline">Cerrar</span>
                        </summary>
                        <div className="mt-4 border-t hairline pt-4">
                          <TreatmentForm
                            value={{
                              id: t.id,
                              category: t.category,
                              name: t.name,
                              description: t.description,
                              durationMinutes: t.durationMinutes,
                              sortOrder: t.sortOrder,
                              active: t.active,
                            }}
                          />
                          <form action={deleteTreatment} className="mt-4 border-t hairline pt-3">
                            <input type="hidden" name="id" value={t.id} />
                            <ConfirmButton
                              message={
                                t._count.bookings > 0
                                  ? "Este tratamiento tiene reservas: se desactivará en lugar de eliminarse. ¿Continuar?"
                                  : "¿Eliminar este tratamiento definitivamente?"
                              }
                            >
                              {t._count.bookings > 0 ? "Desactivar (tiene reservas)" : "Eliminar tratamiento"}
                            </ConfirmButton>
                          </form>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
