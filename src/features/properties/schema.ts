import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional()
);

const money = z.coerce.number().min(0, "Le montant doit être positif ou nul").default(0);

export const propertyTypes = [
  "appartement",
  "maison",
  "studio",
  "local_commercial",
  "parking",
  "autre",
] as const;

export const propertySchema = z.object({
  // Informations générales
  name: z.string().trim().min(1, "Le nom du bien est requis."),
  address: optionalText,
  city: optionalText,
  postal_code: optionalText,
  property_type: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.enum(propertyTypes, { message: "Type de bien invalide." }).optional()
  ),
  surface_m2: z.coerce.number().min(0).optional(),
  rooms: z.coerce.number().int().min(0).optional(),
  floor: z.coerce.number().int().optional(),
  has_elevator: z.coerce.boolean().default(false),
  has_parking: z.coerce.boolean().default(false),
  has_cellar: z.coerce.boolean().default(false),
  has_balcony: z.coerce.boolean().default(false),
  is_furnished: z.coerce.boolean().default(false),

  // Acquisition
  purchase_price: z.coerce.number().min(0).optional(),
  purchase_date: optionalDate,
  notary_fees: money,
  agency_fees: money,
  other_acquisition_fees: money,
  works_budget: money,
  furniture_budget: money,

  // Location
  monthly_rent: money,
  monthly_charges: money,
  rental_start_date: optionalDate,

  // Charges annuelles
  property_tax_annual: money,
  condo_fees_annual: money,
  insurance_annual: money,
  management_fees_annual: money,
  maintenance_annual: money,
  other_charges_annual: money,
});

export type PropertyInput = z.infer<typeof propertySchema>;

export function parsePropertyFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return propertySchema.safeParse({
    ...raw,
    has_elevator: formData.get("has_elevator") === "on",
    has_parking: formData.get("has_parking") === "on",
    has_cellar: formData.get("has_cellar") === "on",
    has_balcony: formData.get("has_balcony") === "on",
    is_furnished: formData.get("is_furnished") === "on",
  });
}
