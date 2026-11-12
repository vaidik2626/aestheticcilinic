"use client";

import { updateBookingNotes } from "@/app/admin/actions";
import { ActionForm, FormMessage, SubmitButton } from "@/components/admin/form";

export function BookingNotes({ id, notes }: { id: string; notes: string }) {
  return (
    <ActionForm action={updateBookingNotes} className="space-y-3">
      {(state) => (
        <>
          <input type="hidden" name="id" value={id} />
          <label htmlFor="adminNotes" className="sr-only">Notas internas</label>
          <textarea id="adminNotes" name="adminNotes" rows={5} defaultValue={notes} maxLength={2000} className="admin-input resize-y" placeholder="Solo visibles para el equipo." />
          <div className="flex items-center justify-between gap-3">
            <FormMessage state={state} />
            <SubmitButton variant="ghost">Guardar</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
