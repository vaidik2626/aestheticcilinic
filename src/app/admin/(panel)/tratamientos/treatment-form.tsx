"use client";

import { saveTreatment } from "@/app/admin/actions";
import { ActionForm, Field, FormMessage, SubmitButton } from "@/components/admin/form";
import { treatmentCategories } from "@/data/treatments";
import type { TreatmentCategory } from "@/types/treatment";

interface TreatmentFormValue {
  id?: string;
  category: TreatmentCategory;
  name: string;
  description: string;
  durationMinutes: number;
  sortOrder: number;
  active: boolean;
}

export function TreatmentForm({ value }: { value?: TreatmentFormValue }) {
  const v = value ?? { category: "FACIAL" as TreatmentCategory, name: "", description: "", durationMinutes: 60, sortOrder: 0, active: true };
  const p = v.id ?? "new";
  return (
    <ActionForm action={saveTreatment} resetOnSuccess={!v.id} className="grid gap-4 md:grid-cols-6">
      {(state) => (
        <>
          {v.id && <input type="hidden" name="id" value={v.id} />}
          <Field label="Nombre" name={`${p}-name`} error={state.errors?.name} className="md:col-span-3">
            <input id={`${p}-name`} name="name" defaultValue={v.name} required className="admin-input" />
          </Field>
          <Field label="Categoría" name={`${p}-category`} error={state.errors?.category} className="md:col-span-2">
            <select id={`${p}-category`} name="category" defaultValue={v.category} className="admin-input">
              {treatmentCategories.map((c) => (
                <option key={c.category} value={c.category}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Duración (min)" name={`${p}-duration`} error={state.errors?.durationMinutes}>
            <input id={`${p}-duration`} name="durationMinutes" type="number" min={10} max={480} step={5} defaultValue={v.durationMinutes} className="admin-input" />
          </Field>
          <Field label="Descripción" name={`${p}-description`} error={state.errors?.description} className="md:col-span-4">
            <textarea id={`${p}-description`} name="description" rows={2} defaultValue={v.description} maxLength={600} className="admin-input resize-y" />
          </Field>
          <Field label="Orden" name={`${p}-order`} hint="Menor aparece primero" error={state.errors?.sortOrder}>
            <input id={`${p}-order`} name="sortOrder" type="number" min={0} max={999} defaultValue={v.sortOrder} className="admin-input" />
          </Field>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={v.active} className="size-4 accent-[var(--primary-dark)]" />
              Activo
            </label>
          </div>
          <div className="flex items-center gap-4 md:col-span-6">
            <SubmitButton>{v.id ? "Guardar cambios" : "Crear tratamiento"}</SubmitButton>
            <FormMessage state={state} />
          </div>
        </>
      )}
    </ActionForm>
  );
}
