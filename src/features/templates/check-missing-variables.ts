"use server";

import { extractTemplateVariables } from "@/lib/templates";
import { getTemplate } from "./queries";
import { buildLeaseTemplateVariables } from "./lease-variables";
import { getLease } from "@/features/leases/queries";
import { LEASE_TEMPLATE_VARIABLES, VARIABLE_LOCATION_LABELS, VARIABLE_REVIEW_FIELD } from "./constants";

export type MissingVariable = {
  key: string;
  description: string;
  locationLabel: string;
  href: string;
  /** Identifiant du champ à mettre en évidence dans l'écran de relecture, si applicable. */
  fieldId?: string;
};

function hrefForLocation(
  location: (typeof LEASE_TEMPLATE_VARIABLES)[number]["location"],
  ctx: { tenantId: string; propertyId: string; leaseId: string }
): string | null {
  switch (location) {
    case "tenant":
      return `/locataires/${ctx.tenantId}/modifier`;
    case "owner":
      return `/parametres/proprietaire`;
    case "property":
      return `/biens/${ctx.propertyId}/modifier`;
    case "lease":
      return `/locataires/${ctx.tenantId}/baux/${ctx.leaseId}/modifier`;
    case "computed":
      return null;
  }
}

/**
 * Compare les variables utilisées par un modèle à celles réellement
 * disponibles pour un bail donné, pour signaler ce qui manque avant de
 * générer le document — avec un lien direct vers l'endroit à compléter.
 */
export async function checkMissingVariables(
  templateId: string,
  leaseId: string
): Promise<MissingVariable[]> {
  const [template, variables, lease] = await Promise.all([
    getTemplate(templateId),
    buildLeaseTemplateVariables(leaseId),
    getLease(leaseId),
  ]);

  if (!template || !variables || !lease) return [];

  const usedKeys = extractTemplateVariables(template.content);
  const ctx = { tenantId: lease.tenant_id, propertyId: lease.property_id, leaseId };

  const missing: MissingVariable[] = [];
  for (const key of usedKeys) {
    if (variables[key] !== "") continue;
    const definition = LEASE_TEMPLATE_VARIABLES.find((v) => v.key === key);
    if (!definition) continue;
    const href = hrefForLocation(definition.location, ctx);
    if (!href) continue;
    missing.push({
      key,
      description: definition.description,
      locationLabel: VARIABLE_LOCATION_LABELS[definition.location],
      href,
      fieldId: VARIABLE_REVIEW_FIELD[key],
    });
  }

  return missing;
}
