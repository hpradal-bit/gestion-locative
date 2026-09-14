import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const NAVY = "#1c2b45";
const INK = "#1f2430";
const MUTED = "#6b7280";
const LINE = "#d8dce3";
const PANEL = "#f4f5f7";

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 42, paddingHorizontal: 52, fontSize: 9.2, fontFamily: "Times-Roman", color: INK },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: NAVY },
  kicker: {
    position: "absolute",
    top: 24,
    right: 52,
    fontSize: 7.5,
    color: MUTED,
    fontFamily: "Helvetica",
    letterSpacing: 1,
  },
  titleBlock: { marginBottom: 14, alignItems: "center" },
  title: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: NAVY,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: MUTED,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  titleRule: { height: 1.4, width: 64, backgroundColor: NAVY },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6 },
  dividerLine: { flex: 1, height: 0.6, backgroundColor: LINE },
  dividerLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginHorizontal: 10,
  },
  soloLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginVertical: 5,
  },
  panel: {
    backgroundColor: PANEL,
    borderLeftWidth: 2,
    borderLeftColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 3,
  },
  panelText: { fontSize: 9.2, lineHeight: 1.3 },
  headingRow: { flexDirection: "row", alignItems: "center", marginTop: 9, marginBottom: 4 },
  headingBullet: { width: 5, height: 5, backgroundColor: NAVY, marginRight: 7 },
  heading: {
    fontSize: 10.2,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.3,
  },
  headingRule: { height: 0.6, backgroundColor: LINE, marginBottom: 6 },
  paragraph: { marginBottom: 6, lineHeight: 1.32, textAlign: "justify" },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, gap: 20 },
  signatureCol: { flex: 1 },
  signatureLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6 },
  signatureBox: { height: 46, borderWidth: 0.7, borderColor: LINE, borderStyle: "solid" },
  smallPrint: {
    marginTop: 14,
    paddingTop: 6,
    borderTopWidth: 0.6,
    borderTopColor: LINE,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MUTED,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: MUTED,
  },
});

const ARTICLE_HEADING = /^ARTICLE\s+\d+\s*—/i;
const DIVIDER_LABEL = /^(Entre les soussignés|Il a été convenu ce qui suit)\s*:?$/i;
const SOLO_LABEL = /^ET$/;
const PARTY_LINE = /ci-après dénommé/i;
const SIGNATURE_LINE = /^Signature du /i;
const SMALL_PRINT = /^Document généré/i;

export function GeneratedDocument({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  // Le premier paragraphe reprend en général le titre du contrat en majuscules
  // (ex. "CONTRAT DE LOCATION D'UN BOX...") : il est déjà affiché comme titre,
  // pas besoin de le répéter dans le corps du document.
  const body = paragraphs[0]?.toUpperCase() === paragraphs[0] ? paragraphs.slice(1) : paragraphs;

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <Text style={styles.kicker} fixed>
          {title.toUpperCase()}
        </Text>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Contrat de location</Text>
          <View style={styles.titleRule} />
        </View>

        {body.map((paragraph, index) => {
          if (ARTICLE_HEADING.test(paragraph)) {
            const separatorIndex = paragraph.indexOf("—");
            const label = separatorIndex === -1 ? paragraph : paragraph.slice(0, separatorIndex).trim();
            const rest = separatorIndex === -1 ? "" : paragraph.slice(separatorIndex + 1).trim();
            return (
              <View key={index}>
                <View style={styles.headingRow}>
                  <View style={styles.headingBullet} />
                  <Text style={styles.heading}>
                    {label}
                    {rest ? ` — ${rest}` : ""}
                  </Text>
                </View>
                <View style={styles.headingRule} />
              </View>
            );
          }

          if (DIVIDER_LABEL.test(paragraph)) {
            return (
              <View key={index} style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>{paragraph.replace(/:$/, "")}</Text>
                <View style={styles.dividerLine} />
              </View>
            );
          }

          if (SOLO_LABEL.test(paragraph)) {
            return (
              <Text key={index} style={styles.soloLabel}>
                {paragraph}
              </Text>
            );
          }

          if (PARTY_LINE.test(paragraph)) {
            return (
              <View key={index} style={styles.panel}>
                <Text style={styles.panelText}>{paragraph}</Text>
              </View>
            );
          }

          if (SIGNATURE_LINE.test(paragraph)) {
            const labels = paragraph.split(/\s{2,}/).filter(Boolean);
            return (
              <View key={index} style={styles.signatureRow}>
                {labels.map((label) => (
                  <View key={label} style={styles.signatureCol}>
                    <Text style={styles.signatureLabel}>{label}</Text>
                    <View style={styles.signatureBox} />
                  </View>
                ))}
              </View>
            );
          }

          if (SMALL_PRINT.test(paragraph)) {
            return (
              <Text key={index} style={styles.smallPrint}>
                {paragraph}
              </Text>
            );
          }

          return (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>{title}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
