"use client";

import { loginAction } from "@/app/admin/actions";
import { ActionForm, Field, FormMessage, SubmitButton } from "@/components/admin/form";

export function LoginForm() {
  return (
    <ActionForm action={loginAction} className="space-y-5">
      {(state) => (
        <>
          <Field label="Correo electrónico" name="email" error={state.errors?.email}>
            <input id="email" name="email" type="email" autoComplete="username" required className="admin-input" />
          </Field>
          <Field label="Contraseña" name="password" error={state.errors?.password}>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="admin-input" />
          </Field>
          <FormMessage state={state} />
          <SubmitButton className="w-full">Entrar</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
