import type { Intensity } from "@/generated/prisma/client";

export const INTENSITY_LABELS: Record<Intensity, string> = {
  SUAVE: "Suave",
  MODERADA: "Moderada",
  MARCANTE: "Marcante",
  INTENSA: "Intensa",
};

export const INTENSITY_ORDER: Intensity[] = ["SUAVE", "MODERADA", "MARCANTE", "INTENSA"];
