import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const INK = "#111111";
const RULE = "#999999";
const MUTED = "#6b7280";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 9.3, fontFamily: "Helvetica", color: INK },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: INK,
    textAlign: "center",
    marginBottom: 10,
  },
  rule: { height: 0.6, backgroundColor: RULE, marginBottom: 22 },
  heading: {
    fontSize: 10.5,
    fontWeight: 700,
    color: INK,
    marginTop: 12,
    marginBottom: 5,
  },
  paragraph: { marginBottom: 9, lineHeight: 1.4, textAlign: "justify" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
  },
});

const ARTICLE_HEADING = /^ARTICLE\s+\d+\s*—/i;

export function GeneratedDocument({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  // Le premier paragraphe reprend en général le titre du contrat en majuscules
  // (ex. "CONTRAT DE LOCATION D'UN BOX...") : il est déjà affiché comme titre,
  // pas besoin de le répéter dans le corps du document.
  const body = paragraphs[0]?.toUpperCase() === paragraphs[0] ? paragraphs.slice(1) : paragraphs;

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
        {body.map((paragraph, index) => (
          <Text key={index} style={ARTICLE_HEADING.test(paragraph) ? styles.heading : styles.paragraph}>
            {paragraph}
          </Text>
        ))}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
