import type { TaxRegime } from "@/lib/finance";

export type DeclarationBox = {
  box: string;
  description: string;
};

export type DeclarationGuide = {
  regime: TaxRegime;
  title: string;
  forms: string[];
  boxes: DeclarationBox[];
  whenProfit: string;
  whenDeficit: string | null;
  carryForward: string | null;
  notes: string[];
};

/**
 * Guide de déclaration — vérifié sur des sources fiables (impots.gouv.fr,
 * service-public.fr) en date du 04/09/2026. Les numéros de case peuvent
 * changer d'une année sur l'autre : à revérifier chaque campagne
 * déclarative avant de faire confiance à ce contenu les yeux fermés.
 */
export const DECLARATION_GUIDE: Record<TaxRegime, DeclarationGuide> = {
  micro_foncier: {
    regime: "micro_foncier",
    title: "Micro-foncier — location vide",
    forms: ["2042 (déclaration principale, pas de formulaire annexe)"],
    boxes: [
      {
        box: "4BE",
        description:
          "Total des loyers bruts encaissés dans l'année (charges refacturées au locataire comprises), sans déduire quoi que ce soit : c'est l'administration qui applique l'abattement de 30 % automatiquement.",
      },
    ],
    whenProfit:
      "Il n'y a pas de notion de déficit en micro-foncier : reportez simplement le total des loyers bruts en case 4BE. L'administration calcule elle-même le revenu imposable (loyers − 30 %).",
    whenDeficit: null,
    carryForward: null,
    notes: [
      "Applicable uniquement si vos revenus fonciers bruts (tous biens loués nus confondus) ne dépassent pas 15 000 €/an. Au-delà, le régime réel s'applique automatiquement, même sans option.",
      "Vous pouvez opter pour le régime réel même sous le seuil si vos charges réelles dépassent 30 % des loyers — option irrévocable pendant 3 ans.",
    ],
  },
  reel_foncier: {
    regime: "reel_foncier",
    title: "Régime réel — location vide",
    forms: ["2044 (détail des revenus fonciers)", "2042 (report du résultat)"],
    boxes: [
      { box: "4BA", description: "Résultat foncier de l'année, si c'est un bénéfice (report depuis la 2044)." },
      {
        box: "4BC",
        description:
          "Part du déficit foncier imputable sur votre revenu global, plafonnée à 10 700 €/an — c'est celle qui réduit vraiment votre impôt cette année.",
      },
      {
        box: "4BB",
        description:
          "Part du déficit non imputée sur le revenu global : intérêts d'emprunt en déficit, plus le surplus au-delà de 10 700 €. Reportable uniquement sur vos revenus fonciers des 10 années suivantes.",
      },
      {
        box: "4BD",
        description: "Déficits fonciers des années précédentes qu'il reste à imputer sur vos revenus fonciers.",
      },
    ],
    whenProfit:
      "Remplissez d'abord la 2044 (loyers, puis chaque charge déductible poste par poste). Le résultat se reporte automatiquement en case 4BA de la 2042 : il s'ajoute à votre revenu global et est taxé à votre TMI, plus 17,2 % de prélèvements sociaux.",
    whenDeficit:
      "Toujours sur la 2044 : le résultat négatif se ventile en deux parts. Reportez le montant imputable sur le revenu global (plafonné à 10 700 €) en case 4BC de la 2042 — il réduit votre impôt de cette année. Le reste (intérêts d'emprunt + surplus) va en case 4BB : il ne réduit rien cette année, mais s'impute automatiquement sur vos futurs revenus fonciers.",
    carryForward:
      "Le déficit reporté en case 4BB (ou resté en 4BD les années suivantes) s'impute en priorité sur vos revenus fonciers des 10 années suivantes, avant tout nouveau calcul d'impôt sur ces revenus — vous n'avez rien à recalculer vous-même, l'administration le fait via la case 4BD préremplie l'année suivante à partir de votre propre déclaration.",
    notes: [
      "Une fois le déficit imputé sur le revenu global une année donnée, vous devez rester au régime réel (et continuer à louer le bien nu) pendant les 3 années suivantes, sous peine de remise en cause.",
      "Le déficit foncier imputable sur le revenu global n'inclut jamais les intérêts d'emprunt : eux ne s'imputent que sur les revenus fonciers, jamais sur le revenu global, même sous le plafond.",
    ],
  },
  lmnp_micro_bic: {
    regime: "lmnp_micro_bic",
    title: "Micro-BIC — location meublée (LMNP)",
    forms: ["2042 C PRO (recettes locations meublées non professionnelles)"],
    boxes: [
      {
        box: "5ND (ou 5OD / 5PD pour le 2ᵉ et 3ᵉ déclarant)",
        description:
          "Recettes brutes encaissées dans l'année (loyers + charges refacturées), sans déduire quoi que ce soit : l'abattement de 50 % est appliqué automatiquement par l'administration.",
      },
    ],
    whenProfit:
      "Reportez le total de vos recettes brutes en case 5ND, dans la section « Revenus des locations meublées non professionnelles » du formulaire 2042 C PRO. C'est tout : pas de détail de charges à fournir.",
    whenDeficit: null,
    carryForward: null,
    notes: [
      "Applicable si vos recettes ne dépassent pas 77 700 €/an. Au-delà, vous basculez au régime réel.",
      "Le micro-BIC ne permet jamais de déficit imputable : si vos charges réelles dépassent l'abattement forfaitaire de 50 %, seul le régime réel vous permettra de le faire apparaître.",
    ],
  },
  lmnp_reel: {
    regime: "lmnp_reel",
    title: "Régime réel — location meublée (LMNP)",
    forms: [
      "2031-SD et 2033 (liasse fiscale simplifiée, régime micro-entreprise BIC réel simplifié)",
      "2042 C PRO (report du résultat)",
    ],
    boxes: [
      { box: "5NA (ou 5NK sans adhésion à un organisme de gestion agréé)", description: "Résultat de l'année si c'est un bénéfice (report depuis la liasse 2031/2033)." },
      { box: "5NY (ou 5NZ sans adhésion à un organisme agréé)", description: "Résultat de l'année si c'est un déficit." },
      {
        box: "5GA à 5GJ",
        description: "Déficits des années précédentes restant à imputer, préremplis par l'administration d'une année sur l'autre.",
      },
    ],
    whenProfit:
      "Le résultat de votre comptabilité (loyers − charges réelles − amortissement) se calcule sur la liasse fiscale 2031/2033, puis se reporte en une seule fois en case 5NA de la 2042 C PRO. L'amortissement est déjà intégré dans ce résultat : ne le déduisez pas une deuxième fois.",
    whenDeficit:
      "Même logique : le résultat négatif de la liasse se reporte en case 5NY. Contrairement au foncier, ce déficit ne s'impute jamais sur votre revenu global — seulement sur vos revenus de location meublée (BIC non professionnels) des 10 années suivantes.",
    carryForward:
      "Le déficit non utilisé cette année (notamment l'amortissement mis en réserve car il ne peut pas créer de déficit) se reporte automatiquement, sans limite de temps pour l'amortissement, et pendant 10 ans pour le déficit de charges — imputable uniquement sur des revenus LMNP futurs, jamais sur le revenu global.",
    notes: [
      "Faire appel à un expert-comptable ou adhérer à un organisme de gestion agréé (OGA) évite une majoration historique de 25 % du bénéfice imposable en cas de non-adhésion — vérifiez les règles en vigueur l'année de votre déclaration, ce point a beaucoup varié ces dernières années.",
      "Depuis la loi de finances 2025, l'amortissement déduit ici est réintégré dans le calcul de la plus-value imposable à la revente du bien : c'est un avantage différé, pas définitivement acquis.",
    ],
  },
};
