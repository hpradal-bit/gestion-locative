import { z } from "zod";

export const simulationNameSchema = z
  .string()
  .trim()
  .min(1, "Le nom de la simulation est requis.")
  .max(120, "Le nom est trop long (120 caractères maximum).");
