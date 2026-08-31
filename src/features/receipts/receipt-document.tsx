import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#111111" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555555", marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 10,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#555555" },
  value: { fontWeight: 700 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5", marginVertical: 16 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#111111",
  },
  totalLabel: { fontSize: 13, fontWeight: 700 },
  totalValue: { fontSize: 13, fontWeight: 700 },
  footer: { marginTop: 40, fontSize: 9, color: "#888888" },
});

function formatEUR(amount: number) {
  // La police PDF standard (Helvetica) ne supporte pas l'espace fine insécable
  // utilisée par Intl pour les milliers en fr-FR (rendue comme "/") : on la
  // remplace par une espace normale.
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
    .format(amount)
    .replace(/[  ]/g, " ");
}

function formatDateFR(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type ReceiptData = {
  owner: { fullName: string; address: string | null };
  tenant: { fullName: string };
  property: { name: string; address: string | null; city: string | null };
  period: { dueDate: string };
  rentAmount: number;
  chargesAmount: number;
  totalAmount: number;
  paidAt: string;
};

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const periodLabel = new Date(data.period.dueDate).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Quittance de loyer — ${periodLabel}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Quittance de loyer</Text>
        <Text style={styles.subtitle}>
          {periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bailleur</Text>
          <Text style={styles.value}>{data.owner.fullName}</Text>
          {data.owner.address && <Text style={styles.label}>{data.owner.address}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locataire</Text>
          <Text style={styles.value}>{data.tenant.fullName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logement</Text>
          <Text style={styles.value}>{data.property.name}</Text>
          {data.property.address && (
            <Text style={styles.label}>
              {[data.property.address, data.property.city].filter(Boolean).join(", ")}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Loyer</Text>
          <Text style={styles.value}>{formatEUR(data.rentAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Charges</Text>
          <Text style={styles.value}>{formatEUR(data.chargesAmount)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total réglé</Text>
          <Text style={styles.totalValue}>{formatEUR(data.totalAmount)}</Text>
        </View>

        <Text style={{ marginTop: 24 }}>
          {`Je soussigné(e) ${data.owner.fullName}, bailleur, déclare avoir reçu de ${data.tenant.fullName} la somme de ${formatEUR(data.totalAmount)} au titre du loyer et des charges pour la période susmentionnée, et lui en donne quittance, sous réserve de tous mes droits.`}
        </Text>

        <Text style={styles.footer}>
          Quittance générée le {formatDateFR(data.paidAt)} — Gestion locative
        </Text>
      </Page>
    </Document>
  );
}
