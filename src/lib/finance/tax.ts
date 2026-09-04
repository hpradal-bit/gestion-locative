/**
 * Fiscalité française de la location — estimation, pas un calcul d'impôt
 * officiel. Chaque régime a ses propres règles ; ce module ne remplace pas
 * un avis d'expert-comptable, en particulier pour le déficit foncier
 * reportable et l'amortissement LMNP réel (règles parmi les plus
 * complexes du droit fiscal français).
 *
 * Paramètres légaux 2026 (revenus 2025) — à mettre à jour chaque année en
 * un seul endroit plutôt que d'éparpiller des nombres magiques dans le code :
 * sources en date du 31/08/2026 (loi de finances 2026, service-public.fr,
 * impots.gouv.fr).
 */
export const TAX_PARAMETERS_2026 = {
  /** Micro-foncier (location vide) : abattement forfaitaire, plafond de revenus. */
  microFoncier: { abattementRate: 0.3, threshold: 15_000 },
  /** Micro-BIC LMNP (location meublée classique, longue durée). */
  lmnpMicroBic: { abattementRate: 0.5, threshold: 77_700 },
  /** Déficit foncier (régime réel, location vide) imputable sur le revenu global. */
  deficitFoncier: { plafondImputationRevenuGlobal: 10_700 },
  /** Prélèvements sociaux sur les revenus fonciers/BIC non professionnels. */
  socialChargesRate: 0.172,
  /** Tranches du barème IR 2026 (revenus 2025), pour affichage informatif uniquement. */
  incomeTaxBrackets: [
    { upTo: 11_600, rate: 0 },
    { upTo: 29_579, rate: 0.11 },
    { upTo: 84_577, rate: 0.3 },
    { upTo: 181_917, rate: 0.41 },
    { upTo: Infinity, rate: 0.45 },
  ],
} as const;

export const taxRegimes = [
  "micro_foncier",
  "reel_foncier",
  "lmnp_micro_bic",
  "lmnp_reel",
] as const;

export type TaxRegime = (typeof taxRegimes)[number];

export const taxRegimeLabels: Record<TaxRegime, string> = {
  micro_foncier: "Micro-foncier (location vide)",
  reel_foncier: "Régime réel foncier (location vide)",
  lmnp_micro_bic: "Micro-BIC (location meublée — LMNP)",
  lmnp_reel: "Régime réel (location meublée — LMNP)",
};

/**
 * Une ligne du détail de calcul, affichée telle quelle dans la page Impôts
 * pour que l'utilisateur puisse suivre — et vérifier — chaque étape.
 * `amount` est signé : positif = ajouté à la base, négatif = déduit.
 */
export type TaxCalculationStep = {
  label: string;
  amount: number;
  note?: string;
};

export type TaxEstimate = {
  /** Base imposable retenue après abattement/charges/amortissement. */
  taxableIncome: number;
  /** Impôt sur le revenu estimé (taxableIncome × TMI), hors effet du déficit imputé. */
  incomeTax: number;
  /** Prélèvements sociaux estimés (17,2 % de la base imposable, jamais réduits par le déficit foncier). */
  socialCharges: number;
  /** Gain d'impôt sur le revenu global procuré par un déficit foncier imputé (réel foncier uniquement). */
  incomeTaxSavingFromDeficit: number;
  /** Montant d'amortissement non utilisé cette année, reportable sans limite de temps (LMNP réel uniquement). */
  carriedForwardAmortization: number;
  /** Part du déficit foncier reportable sur les revenus fonciers des 10 années suivantes (réel foncier uniquement). */
  deficitCarriedForwardOnFonciers: number;
  /** Somme des deux prélèvements, nette du gain d'impôt lié à un déficit imputé. */
  totalTax: number;
  /** Détail étape par étape du calcul, dans l'ordre où il doit se lire. */
  steps: TaxCalculationStep[];
};

function zeroEstimate(): TaxEstimate {
  return {
    taxableIncome: 0,
    incomeTax: 0,
    socialCharges: 0,
    incomeTaxSavingFromDeficit: 0,
    carriedForwardAmortization: 0,
    deficitCarriedForwardOnFonciers: 0,
    totalTax: 0,
    steps: [],
  };
}

/**
 * Micro-foncier : abattement forfaitaire de 30 % sur les loyers bruts, sans
 * déduire les charges réelles. Applicable si les loyers bruts annuels ne
 * dépassent pas le seuil légal (15 000 € en 2026) — au-delà, le régime réel
 * s'applique de plein droit.
 */
export function calculateMicroFoncierTax(input: {
  grossAnnualRent: number;
  tmiRate: number;
  applySocialCharges?: boolean;
  abattementRate?: number;
}): TaxEstimate {
  const abattementRate = input.abattementRate ?? TAX_PARAMETERS_2026.microFoncier.abattementRate;
  const abattement = input.grossAnnualRent * abattementRate;
  const taxableIncome = Math.max(0, input.grossAnnualRent - abattement);
  const incomeTax = taxableIncome * input.tmiRate;
  const socialCharges =
    input.applySocialCharges === false ? 0 : taxableIncome * TAX_PARAMETERS_2026.socialChargesRate;

  return {
    ...zeroEstimate(),
    taxableIncome,
    incomeTax,
    socialCharges,
    totalTax: incomeTax + socialCharges,
    steps: [
      { label: "Revenus locatifs bruts encaissés", amount: input.grossAnnualRent },
      {
        label: `Abattement forfaitaire micro-foncier (${Math.round(abattementRate * 100)} %)`,
        amount: -abattement,
        note: "Forfait légal censé couvrir toutes les charges — aucune charge réelle n'est déduite en plus, même si elle est supérieure.",
      },
      { label: "= Revenu imposable", amount: taxableIncome },
      {
        label: `Impôt sur le revenu (${Math.round(input.tmiRate * 100)} % — votre TMI)`,
        amount: incomeTax,
      },
      {
        label: "Prélèvements sociaux (17,2 %)",
        amount: socialCharges,
        note: input.applySocialCharges === false ? "Désactivés dans vos paramètres." : undefined,
      },
      { label: "= Impôt total estimé pour ce bien", amount: incomeTax + socialCharges },
    ],
  };
}

/**
 * Régime réel foncier (location vide) : les charges réellement déductibles
 * (intérêts d'emprunt, taxe foncière, assurance PNO, frais de gestion,
 * travaux d'entretien/réparation — pas les travaux d'agrandissement) sont
 * soustraites des loyers bruts. Un résultat négatif est un déficit
 * foncier : la part hors intérêts d'emprunt est imputable sur le revenu
 * global dans la limite légale (10 700 € en 2026) ; le surplus et la part
 * liée aux intérêts d'emprunt se reportent sur les revenus fonciers des 10
 * années suivantes (le report d'une année sur l'autre n'est pas modélisé
 * ici — `deficitCarriedForwardOnFonciers` indique le montant à reporter
 * manuellement l'année suivante). Le déficit imputé réduit l'IR mais
 * jamais les prélèvements sociaux.
 */
export function calculateRealFoncierTax(input: {
  grossAnnualRent: number;
  deductibleExpenses: number;
  tmiRate: number;
  applySocialCharges?: boolean;
  deficitCeiling?: number;
}): TaxEstimate {
  const result = input.grossAnnualRent - input.deductibleExpenses;
  const baseSteps: TaxCalculationStep[] = [
    { label: "Revenus locatifs bruts encaissés", amount: input.grossAnnualRent },
    {
      label: "Charges réelles déductibles",
      amount: -input.deductibleExpenses,
      note: "Intérêts d'emprunt, taxe foncière, assurance PNO, frais de gestion, travaux d'entretien/réparation — pas les travaux d'agrandissement ni le remboursement du capital.",
    },
  ];

  if (result >= 0) {
    const incomeTax = result * input.tmiRate;
    const socialCharges =
      input.applySocialCharges === false ? 0 : result * TAX_PARAMETERS_2026.socialChargesRate;
    return {
      ...zeroEstimate(),
      taxableIncome: result,
      incomeTax,
      socialCharges,
      totalTax: incomeTax + socialCharges,
      steps: [
        ...baseSteps,
        { label: "= Résultat foncier (bénéfice)", amount: result },
        { label: `Impôt sur le revenu (${Math.round(input.tmiRate * 100)} % — votre TMI)`, amount: incomeTax },
        {
          label: "Prélèvements sociaux (17,2 %)",
          amount: socialCharges,
          note: input.applySocialCharges === false ? "Désactivés dans vos paramètres." : undefined,
        },
        { label: "= Impôt total estimé pour ce bien", amount: incomeTax + socialCharges },
      ],
    };
  }

  const ceiling = input.deficitCeiling ?? TAX_PARAMETERS_2026.deficitFoncier.plafondImputationRevenuGlobal;
  const deficit = -result;
  const imputedOnGlobalIncome = Math.min(deficit, ceiling);
  const deficitCarriedForwardOnFonciers = deficit - imputedOnGlobalIncome;
  const incomeTaxSavingFromDeficit = imputedOnGlobalIncome * input.tmiRate;

  return {
    ...zeroEstimate(),
    taxableIncome: 0,
    incomeTaxSavingFromDeficit,
    deficitCarriedForwardOnFonciers,
    totalTax: -incomeTaxSavingFromDeficit,
    steps: [
      ...baseSteps,
      { label: "= Résultat foncier (déficit)", amount: result },
      {
        label: `Déficit imputable sur le revenu global (plafond ${ceiling.toLocaleString("fr-FR")} €/an)`,
        amount: -imputedOnGlobalIncome,
        note: "Réduit votre revenu imposable global, pas seulement vos revenus fonciers.",
      },
      ...(deficitCarriedForwardOnFonciers > 0
        ? [
            {
              label: "Déficit reporté sur les revenus fonciers des 10 prochaines années",
              amount: -deficitCarriedForwardOnFonciers,
              note: "Part au-delà du plafond, plus les intérêts d'emprunt (jamais imputables sur le revenu global).",
            } satisfies TaxCalculationStep,
          ]
        : []),
      {
        label: `Économie d'impôt sur le revenu (${Math.round(input.tmiRate * 100)} % du déficit imputé)`,
        amount: -incomeTaxSavingFromDeficit,
        note: "Un déficit foncier n'engendre jamais d'impôt à payer : il en fait économiser.",
      },
      {
        label: "= Effet total sur votre impôt (négatif = économie)",
        amount: -incomeTaxSavingFromDeficit,
      },
    ],
  };
}

/**
 * Micro-BIC LMNP (location meublée non professionnelle, longue durée) :
 * abattement forfaitaire de 50 % sur les loyers bruts. Applicable si les
 * loyers bruts annuels ne dépassent pas le seuil légal (77 700 € en 2026).
 * Les meublés de tourisme (courte durée) ont des seuils et abattements
 * différents, non couverts ici.
 */
export function calculateLmnpMicroBicTax(input: {
  grossAnnualRent: number;
  tmiRate: number;
  applySocialCharges?: boolean;
  abattementRate?: number;
}): TaxEstimate {
  const abattementRate = input.abattementRate ?? TAX_PARAMETERS_2026.lmnpMicroBic.abattementRate;
  const abattement = input.grossAnnualRent * abattementRate;
  const taxableIncome = Math.max(0, input.grossAnnualRent - abattement);
  const incomeTax = taxableIncome * input.tmiRate;
  const socialCharges =
    input.applySocialCharges === false ? 0 : taxableIncome * TAX_PARAMETERS_2026.socialChargesRate;

  return {
    ...zeroEstimate(),
    taxableIncome,
    incomeTax,
    socialCharges,
    totalTax: incomeTax + socialCharges,
    steps: [
      { label: "Recettes locatives brutes", amount: input.grossAnnualRent },
      {
        label: `Abattement forfaitaire micro-BIC (${Math.round(abattementRate * 100)} %)`,
        amount: -abattement,
        note: "Forfait légal censé couvrir toutes les charges, y compris l'amortissement — aucune charge réelle n'est déduite en plus.",
      },
      { label: "= Bénéfice imposable", amount: taxableIncome },
      { label: `Impôt sur le revenu (${Math.round(input.tmiRate * 100)} % — votre TMI)`, amount: incomeTax },
      {
        label: "Prélèvements sociaux (17,2 %)",
        amount: socialCharges,
        note: input.applySocialCharges === false ? "Désactivés dans vos paramètres." : undefined,
      },
      { label: "= Impôt total estimé pour ce bien", amount: incomeTax + socialCharges },
    ],
  };
}

/**
 * Régime réel LMNP : déduit les charges réelles ET l'amortissement du bien
 * (hors terrain) et du mobilier. Règle clé : l'amortissement ne peut
 * jamais créer ni aggraver un déficit — il est plafonné au résultat avant
 * amortissement, et l'excédent non utilisé se reporte sans limite de
 * temps. Cet amortissement différé n'est PAS modélisé sur plusieurs années
 * ici : `carriedForwardAmortization` indique le montant à reporter
 * manuellement l'année suivante.
 *
 * Important : depuis la loi de finances 2025, l'amortissement déduit en
 * LMNP réel est réintégré dans le calcul de la plus-value imposable à la
 * revente du bien — un avantage différé, pas définitif. Ce module ne
 * calcule pas la plus-value de cession.
 */
export function calculateLmnpRealTax(input: {
  grossAnnualRent: number;
  deductibleExpenses: number;
  amortization: number;
  tmiRate: number;
  applySocialCharges?: boolean;
}): TaxEstimate {
  const resultBeforeAmortization = input.grossAnnualRent - input.deductibleExpenses;
  const usedAmortization = Math.min(input.amortization, Math.max(0, resultBeforeAmortization));
  const taxableIncome = Math.max(0, resultBeforeAmortization - usedAmortization);
  const carriedForwardAmortization = input.amortization - usedAmortization;

  const incomeTax = taxableIncome * input.tmiRate;
  const socialCharges =
    input.applySocialCharges === false ? 0 : taxableIncome * TAX_PARAMETERS_2026.socialChargesRate;

  return {
    ...zeroEstimate(),
    taxableIncome,
    incomeTax,
    socialCharges,
    carriedForwardAmortization,
    totalTax: incomeTax + socialCharges,
    steps: [
      { label: "Recettes locatives brutes", amount: input.grossAnnualRent },
      {
        label: "Charges réelles déductibles",
        amount: -input.deductibleExpenses,
        note: "Intérêts d'emprunt, taxe foncière, assurance, frais de gestion, entretien, comptabilité...",
      },
      { label: "= Résultat avant amortissement", amount: resultBeforeAmortization },
      {
        label: "Amortissement du bien et du mobilier",
        amount: -usedAmortization,
        note:
          usedAmortization < input.amortization
            ? "Plafonné au résultat avant amortissement : il ne peut jamais créer ni aggraver un déficit."
            : undefined,
      },
      { label: "= Bénéfice imposable", amount: taxableIncome },
      { label: `Impôt sur le revenu (${Math.round(input.tmiRate * 100)} % — votre TMI)`, amount: incomeTax },
      {
        label: "Prélèvements sociaux (17,2 %)",
        amount: socialCharges,
        note: input.applySocialCharges === false ? "Désactivés dans vos paramètres." : undefined,
      },
      { label: "= Impôt total estimé pour ce bien", amount: incomeTax + socialCharges },
      ...(carriedForwardAmortization > 0
        ? [
            {
              label: "Amortissement non utilisé, reporté sans limite de temps",
              amount: -carriedForwardAmortization,
              note: "À réutiliser dès qu'un résultat futur le permet — jamais perdu, seulement différé.",
            } satisfies TaxCalculationStep,
          ]
        : []),
    ],
  };
}

export type TaxEstimateInput = {
  regime: TaxRegime;
  grossAnnualRent: number;
  deductibleExpenses: number;
  amortization?: number;
  tmiRate: number;
  applySocialCharges?: boolean;
};

/** Point d'entrée unique : distribue vers la bonne fonction selon le régime choisi pour le bien. */
export function estimateTax(input: TaxEstimateInput): TaxEstimate {
  switch (input.regime) {
    case "micro_foncier":
      return calculateMicroFoncierTax(input);
    case "reel_foncier":
      return calculateRealFoncierTax(input);
    case "lmnp_micro_bic":
      return calculateLmnpMicroBicTax(input);
    case "lmnp_reel":
      return calculateLmnpRealTax({ ...input, amortization: input.amortization ?? 0 });
  }
}
