export const TREATMENT_CATEGORIES = ["FACIAL", "CORPORAL", "POSTOPERATORIO", "ASESORAMIENTO"] as const;
export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

/** Tratamiento reservable, tal como se expone al cliente. */
export interface PublicTreatment {
  id: string;
  category: TreatmentCategory;
  name: string;
  description: string;
  durationMinutes: number;
}
