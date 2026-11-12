"use client";

import Image from "next/image";
import { saveGalleryImage, saveSiteContent, saveTestimonial } from "@/app/admin/actions";
import { ActionForm, Field, FormMessage, SubmitButton } from "@/components/admin/form";
import { treatmentCategories } from "@/data/treatments";
import type { SiteContent } from "@/lib/content";
import type { TreatmentCategory } from "@/types/treatment";

type TextField = { key: string; label: string; rows?: number; hint?: string };

const groups: { title: string; section: keyof SiteContent; fields: TextField[] }[] = [
  {
    title: "Contacto",
    section: "contact",
    fields: [
      { key: "whatsappPhone", label: "Número de WhatsApp (solo dígitos, con indicativo)", hint: "Ej.: 573212702791" },
      { key: "whatsappDisplay", label: "Número visible", hint: "Ej.: +57 321 270 2791" },
      { key: "email", label: "Correo público (opcional)" },
      { key: "hoursNote", label: "Nota de horario", hint: "Ej.: Atención con cita previa." },
    ],
  },
  {
    title: "Inicio",
    section: "home",
    fields: [
      { key: "heroHeadline", label: "Titular principal" },
      { key: "heroText", label: "Texto del hero", rows: 2 },
      { key: "introHeadline", label: "Titular de bienvenida" },
      { key: "introBody", label: "Texto de bienvenida", rows: 5 },
      { key: "editorialText", label: "Texto de la sección editorial", rows: 3 },
    ],
  },
  {
    title: "Sobre Claudia",
    section: "about",
    fields: [
      { key: "introduction", label: "Presentación", rows: 4, hint: "Los textos que empiezan por [Pendiente] se muestran como marcador." },
      { key: "background", label: "Trayectoria profesional (solo información verificada)", rows: 4 },
      { key: "philosophy", label: "Filosofía", rows: 4 },
      { key: "approach", label: "Atención personalizada", rows: 4 },
      { key: "portraitSrc", label: "Retrato (ruta /images/... o URL https)", hint: "Déjalo vacío para mostrar el marcador de posición." },
    ],
  },
];

export function SiteContentForm({ value }: { value: SiteContent }) {
  return (
    <ActionForm action={saveSiteContent} className="space-y-10">
      {(state) => (
        <>
          {groups.map((g) => (
            <fieldset key={g.title} className="grid gap-4 md:grid-cols-2">
              <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink/70">{g.title}</legend>
              {g.fields.map((f) => {
                const name = `${g.section}.${f.key}`;
                const current = (value[g.section] as Record<string, string>)[f.key] ?? "";
                return (
                  <Field key={name} label={f.label} name={name} hint={f.hint} error={state.errors?.[name]} className={f.rows ? "md:col-span-2" : ""}>
                    {f.rows ? (
                      <textarea id={name} name={name} rows={f.rows} defaultValue={current} className="admin-input resize-y" />
                    ) : (
                      <input id={name} name={name} defaultValue={current} className="admin-input" />
                    )}
                  </Field>
                );
              })}
            </fieldset>
          ))}
          <div className="sticky bottom-0 flex items-center gap-4 border-t hairline bg-white py-4">
            <SubmitButton>Publicar contenido</SubmitButton>
            <FormMessage state={state} />
          </div>
        </>
      )}
    </ActionForm>
  );
}

interface GalleryValue {
  id?: string;
  src: string;
  alt: string;
  label: string;
  sortOrder: number;
  active: boolean;
}

export function GalleryForm({ value }: { value?: GalleryValue }) {
  const v = value ?? { src: "", alt: "", label: "", sortOrder: 0, active: true };
  const p = v.id ?? "new-g";
  return (
    <ActionForm action={saveGalleryImage} resetOnSuccess={!v.id} className="grid items-end gap-3 md:grid-cols-12">
      {(state) => (
        <>
          {v.id && <input type="hidden" name="id" value={v.id} />}
          {v.src && (
            <div className="relative hidden aspect-square w-full overflow-hidden bg-surface md:col-span-1 md:block">
              <Image src={v.src} alt="" fill sizes="80px" unoptimized={v.src.startsWith("http")} className="object-cover" />
            </div>
          )}
          <Field label="Ruta o URL" name={`${p}-src`} error={state.errors?.src} className={v.src ? "md:col-span-3" : "md:col-span-4"}>
            <input id={`${p}-src`} name="src" defaultValue={v.src} placeholder="/images/mi-foto.jpg" className="admin-input" />
          </Field>
          <Field label="Texto alternativo" name={`${p}-alt`} error={state.errors?.alt} className="md:col-span-3">
            <input id={`${p}-alt`} name="alt" defaultValue={v.alt} className="admin-input" />
          </Field>
          <Field label="Etiqueta" name={`${p}-label`} className="md:col-span-2">
            <input id={`${p}-label`} name="label" defaultValue={v.label} maxLength={60} className="admin-input" />
          </Field>
          <Field label="Orden" name={`${p}-order`} className="md:col-span-1">
            <input id={`${p}-order`} name="sortOrder" type="number" min={0} defaultValue={v.sortOrder} className="admin-input" />
          </Field>
          <label className="flex items-center gap-2 pb-2.5 text-xs md:col-span-1">
            <input type="checkbox" name="active" defaultChecked={v.active} className="size-4 accent-[var(--primary-dark)]" /> Visible
          </label>
          <div className="md:col-span-1"><SubmitButton variant={v.id ? "ghost" : "primary"}>{v.id ? "Guardar" : "Añadir"}</SubmitButton></div>
          <div className="md:col-span-12"><FormMessage state={state} /></div>
        </>
      )}
    </ActionForm>
  );
}

interface TestimonialValue {
  id?: string;
  firstName: string;
  text: string;
  category: TreatmentCategory | null;
  consentConfirmed: boolean;
  published: boolean;
  sortOrder: number;
}

export function TestimonialForm({ value }: { value?: TestimonialValue }) {
  const v = value ?? { firstName: "", text: "", category: null, consentConfirmed: false, published: false, sortOrder: 0 };
  const p = v.id ?? "new-t";
  return (
    <ActionForm action={saveTestimonial} resetOnSuccess={!v.id} className="grid gap-3 md:grid-cols-6">
      {(state) => (
        <>
          {v.id && <input type="hidden" name="id" value={v.id} />}
          <Field label="Nombre de pila" name={`${p}-name`} error={state.errors?.firstName} className="md:col-span-2">
            <input id={`${p}-name`} name="firstName" defaultValue={v.firstName} maxLength={40} className="admin-input" />
          </Field>
          <Field label="Tratamiento (opcional)" name={`${p}-cat`} className="md:col-span-2">
            <select id={`${p}-cat`} name="category" defaultValue={v.category ?? ""} className="admin-input">
              <option value="">—</option>
              {treatmentCategories.map((c) => (
                <option key={c.category} value={c.category}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Orden" name={`${p}-order`} className="md:col-span-2">
            <input id={`${p}-order`} name="sortOrder" type="number" min={0} defaultValue={v.sortOrder} className="admin-input" />
          </Field>
          <Field label="Testimonio" name={`${p}-text`} error={state.errors?.text} className="md:col-span-6">
            <textarea id={`${p}-text`} name="text" rows={3} defaultValue={v.text} maxLength={600} className="admin-input resize-y" />
          </Field>
          <div className="flex flex-wrap items-center gap-6 text-sm md:col-span-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="consentConfirmed" defaultChecked={v.consentConfirmed} className="size-4 accent-[var(--primary-dark)]" />
              La clienta autorizó su publicación
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" defaultChecked={v.published} className="size-4 accent-[var(--primary-dark)]" />
              Publicado
            </label>
            {state.errors?.consentConfirmed && <span className="text-xs text-[#a24a3a]">{state.errors.consentConfirmed}</span>}
          </div>
          <div className="flex items-center gap-4 md:col-span-6">
            <SubmitButton variant={v.id ? "ghost" : "primary"}>{v.id ? "Guardar" : "Añadir testimonio"}</SubmitButton>
            <FormMessage state={state} />
          </div>
        </>
      )}
    </ActionForm>
  );
}
