import { Document, Page, StyleSheet, Text } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#111111" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  paragraph: { marginBottom: 10, lineHeight: 1.5 },
});

export function GeneratedDocument({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
