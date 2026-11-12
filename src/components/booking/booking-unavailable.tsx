"use client";

import { useState } from "react";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { treatmentCategories } from "@/data/treatments";
import { cn } from "@/lib/utils";
import { whatsappMessages, whatsappUrl } from "@/lib/whatsapp";
import type { TreatmentCategory } from "@/types/treatment";

/**
 * Reserva asistida por WhatsApp: se muestra cuando la reserva en línea no está
 * activa, no hay horario configurado o el servicio no responde.
 * Nunca simula una reserva guardada.
 */
export function BookingUnavailable({ whatsappPhone, reason }: { whatsappPhone: string; reason: "inactive" | "down" }) {
  const [category, setCategory] = useState<TreatmentCategory | null>(null);
  const message = category
    ? `${whatsappMessages.appointment} Me interesa: ${treatmentCategories.find((c) => c.category === category)!.label.toLowerCase()}.`
    : whatsappMessages.appointment;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-primary">Reserva asistida</p>
      <h2 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-primary-dark">
        Agenda tu cita por WhatsApp.
      </h2>
      <p className="mt-5 max-w-xl leading-relaxed text-ink/75">
        {reason === "down"
          ? "En este momento la reserva en línea no está disponible. Escríbenos y te ayudaremos a encontrar el mejor horario."
          : "Nuestra agenda en línea se está preparando. Mientras tanto, escríbenos por WhatsApp y te ayudaremos a reservar."}
      </p>

      <fieldset className="mt-12">
        <legend className="eyebrow mb-4 text-muted">¿Qué te interesa? (opcional)</legend>
        <div className="flex flex-wrap gap-3">
          {treatmentCategories.map((c) => (
            <button
              key={c.category}
              type="button"
              aria-pressed={category === c.category}
              onClick={() => setCategory(category === c.category ? null : c.category)}
              className={cn(
                "rounded-full border px-5 py-3 text-sm transition-colors",
                category === c.category ? "border-primary-dark bg-primary-dark text-background" : "border-ink/20 hover:border-primary-dark",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <ButtonLink href={whatsappUrl(message, whatsappPhone)} external icon={<WhatsappIcon size={16} />}>
          Reservar por WhatsApp
        </ButtonLink>
      </div>
    </div>
  );
}
