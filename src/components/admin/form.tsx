"use client";

import { Loader2 } from "lucide-react";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const PendingContext = createContext(false);

export function SubmitButton({ children, variant = "primary", className }: { children: ReactNode; variant?: "primary" | "ghost" | "danger"; className?: string }) {
  const actionPending = useContext(PendingContext);
  const { pending: formPending } = useFormStatus();
  const pending = actionPending || formPending;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50",
        variant === "primary" && "bg-primary-dark text-background hover:bg-primary",
        variant === "ghost" && "border border-ink/15 bg-white hover:border-primary-dark",
        variant === "danger" && "text-[#a24a3a] hover:bg-[#a24a3a]/10",
        className,
      )}
    >
      {pending && <Loader2 size={13} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-ink/70">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[0.7rem] text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-[0.72rem] text-[#a24a3a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={cn("text-sm", state.ok ? "text-[#3f6b4a]" : "text-[#a24a3a]")}>
      {state.message}
    </p>
  );
}

/**
 * Formulario conectado a una server action con estado (errores, mensaje).
 * Se envía con startTransition en lugar de `action={…}` para que React no
 * vacíe los campos cuando la validación falla; solo se limpia si resetOnSuccess.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: (state: ActionState) => ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  return (
    <PendingContext.Provider value={pending}>
      <form ref={ref} onSubmit={onSubmit} className={className} noValidate aria-busy={pending}>
        {children(state)}
      </form>
    </PendingContext.Provider>
  );
}

/** Botón de acción simple con confirmación opcional (eliminar, cancelar…). */
export function ConfirmButton({ children, message, className }: { children: ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn("text-xs font-semibold text-[#a24a3a] hover:underline disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}
