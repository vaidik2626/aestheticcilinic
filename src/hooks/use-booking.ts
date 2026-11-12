"use client";

import { useCallback, useReducer } from "react";
import type { BookingConfirmation, BookingDraft, CustomerDetails, TimeSlot } from "@/types/booking";
import type { PublicTreatment, TreatmentCategory } from "@/types/treatment";

export const BOOKING_STEPS = ["Servicio", "Fecha", "Hora", "Tus datos", "Resumen"] as const;
export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5; // 5 = confirmación

interface State {
  step: StepIndex;
  direction: 1 | -1;
  draft: BookingDraft;
  confirmation: BookingConfirmation | null;
  idempotencyKey: string;
}

type Action =
  | { type: "category"; category: TreatmentCategory }
  | { type: "treatment"; treatment: PublicTreatment }
  | { type: "date"; date: string }
  | { type: "slot"; slot: TimeSlot | null }
  | { type: "customer"; customer: CustomerDetails }
  | { type: "goto"; step: StepIndex }
  | { type: "confirmed"; booking: BookingConfirmation }
  | { type: "reset" };

const emptyCustomer: CustomerDetails = { fullName: "", email: "", whatsapp: "", message: "", consent: false };

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );

function init({ category, treatment }: { category: TreatmentCategory | null; treatment: PublicTreatment | null }): State {
  return {
    step: treatment ? 1 : 0,
    direction: 1,
    draft: { category: treatment?.category ?? category, treatment, date: null, slot: null, customer: emptyCustomer },
    confirmation: null,
    idempotencyKey: newKey(),
  };
}

function reducer(state: State, action: Action): State {
  const { draft } = state;
  switch (action.type) {
    case "category":
      if (draft.category === action.category) return state;
      return { ...state, draft: { ...draft, category: action.category, treatment: null, date: null, slot: null } };
    case "treatment": {
      const changed = draft.treatment?.id !== action.treatment.id;
      return {
        ...state,
        draft: { ...draft, treatment: action.treatment, date: changed ? null : draft.date, slot: changed ? null : draft.slot },
      };
    }
    case "date":
      return { ...state, draft: { ...draft, date: action.date, slot: draft.date === action.date ? draft.slot : null } };
    case "slot":
      return { ...state, draft: { ...draft, slot: action.slot } };
    case "customer":
      return { ...state, draft: { ...draft, customer: action.customer } };
    case "goto":
      return { ...state, step: action.step, direction: action.step >= state.step ? 1 : -1 };
    case "confirmed":
      return { ...state, step: 5, direction: 1, confirmation: action.booking };
    case "reset":
      return init({ category: null, treatment: null });
  }
}

export function useBooking(initial: { category: TreatmentCategory | null; treatment: PublicTreatment | null }) {
  const [state, dispatch] = useReducer(reducer, initial, init);

  const canEnter = useCallback(
    (step: StepIndex) => {
      const d = state.draft;
      if (step === 0) return true;
      if (step === 1) return Boolean(d.treatment);
      if (step === 2) return Boolean(d.treatment && d.date);
      if (step === 3) return Boolean(d.treatment && d.date && d.slot);
      if (step === 4) return Boolean(d.treatment && d.date && d.slot && d.customer.consent);
      return false;
    },
    [state.draft],
  );

  return { state, dispatch, canEnter };
}
