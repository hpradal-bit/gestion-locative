import path from "node:path";
import { Document, Page, StyleSheet, Text, View, Font } from "@react-pdf/renderer";
import type { StyleProp } from "@react-pdf/types";

import { parseDocumentBlocks, groupByHeading, type DocumentBlock } from "@/lib/document-blocks";
import { splitEmphasis } from "@/lib/emphasis";

const NAVY = "#1c2b45";
const INK = "#1f2430";
const MUTED = "#6b7280";
const LINE = "#d8dce3";
const PANEL = "#f4f5f7";

Font.register({
  family: "Caveat",
  src: path.join(process.cwd(), "public/fonts/Caveat-Regular.ttf"),
});

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
  panelTextBold: { fontFamily: "Times-Bold" },
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
  paragraphBold: { fontFamily: "Times-Bold" },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, gap: 20 },
  signatureCol: { flex: 1 },
  signatureLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6 },
  signatureBox: {
    height: 46,
    borderWidth: 0.7,
    borderColor: LINE,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  signaturePending: { fontSize: 7.5, fontFamily: "Helvetica", color: MUTED },
  signatureScript: { fontSize: 22, fontFamily: "Caveat", color: NAVY },
  signatureMeta: {
    marginTop: 4,
    fontSize: 7,
    fontFamily: "Helvetica",
    color: MUTED,
    textAlign: "center",
  },
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

export type SignatureInfo = { name: string; signedAt: string };

type GeneratedDocumentProps = {
  title: string;
  content: string;
  /** Bailleur/Locataire : renseigné une fois le champ signé, sinon la case reste vide et cliquable. */
  signatures?: { owner?: SignatureInfo; tenant?: SignatureInfo };
};

function signatureInfoFor(label: string, signatures: GeneratedDocumentProps["signatures"]) {
  if (!signatures) return undefined;
  return /bailleur/i.test(label) ? signatures.owner : signatures.tenant;
}

/** Rend un texte marqué (lib/emphasis) en alternant portions normales et en gras. */
function Runs({ text, boldStyle }: { text: string; boldStyle: StyleProp }) {
  return (
    <>
      {splitEmphasis(text).map((run, index) =>
        run.bold ? (
          <Text key={index} style={boldStyle}>
            {run.text}
          </Text>
        ) : (
          run.text
        )
      )}
    </>
  );
}

function renderBlock(block: DocumentBlock, key: string | number, signatures: GeneratedDocumentProps["signatures"]) {
  switch (block.type) {
    case "heading":
      return (
        <View key={key}>
          <View style={styles.headingRow}>
            <View style={styles.headingBullet} />
            <Text style={styles.heading}>
              {block.label}
              {block.rest ? " — " : ""}
              {block.rest ? <Runs text={block.rest} boldStyle={styles.heading} /> : null}
            </Text>
          </View>
          <View style={styles.headingRule} />
        </View>
      );
    case "divider":
      return (
        <View key={key} style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>{block.label}</Text>
          <View style={styles.dividerLine} />
        </View>
      );
    case "solo":
      return (
        <Text key={key} style={styles.soloLabel}>
          {block.label}
        </Text>
      );
    case "party":
      return (
        <View key={key} style={styles.panel}>
          <Text style={styles.panelText}>
            <Runs text={block.text} boldStyle={styles.panelTextBold} />
          </Text>
        </View>
      );
    case "signature":
      return (
        <View key={key} style={styles.signatureRow}>
          {block.labels.map((label) => {
            const info = signatureInfoFor(label, signatures);
            return (
              <View key={label} style={styles.signatureCol}>
                <Text style={styles.signatureLabel}>{label}</Text>
                <View style={styles.signatureBox}>
                  {info ? (
                    <Text style={styles.signatureScript}>{info.name}</Text>
                  ) : signatures ? (
                    <Text style={styles.signaturePending}>En attente de signature</Text>
                  ) : null}
                </View>
                {info && <Text style={styles.signatureMeta}>Signé le {info.signedAt}</Text>}
              </View>
            );
          })}
        </View>
      );
    case "smallprint":
      return (
        <Text key={key} style={styles.smallPrint}>
          {block.text}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={key} style={styles.paragraph}>
          <Runs text={block.text} boldStyle={styles.paragraphBold} />
        </Text>
      );
  }
}

export function GeneratedDocument({ title, content, signatures }: GeneratedDocumentProps) {
  const blocks = parseDocumentBlocks(content);

  // Un titre d'article ne doit jamais rester seul en bas d'une page : on le
  // regroupe avec le(s) bloc(s) qui le suivent immédiatement dans un bloc
  // non sécable (wrap={false}) — soit le groupe entier tient sur la page,
  // soit il bascule en entier au début de la page suivante.
  const groups = groupByHeading(blocks);

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

        {groups.map((group, groupIndex) =>
          group.length > 1 || group[0].type === "heading" ? (
            <View key={groupIndex} wrap={false}>
              {group.map((block, index) => renderBlock(block, `${groupIndex}-${index}`, signatures))}
            </View>
          ) : (
            renderBlock(group[0], groupIndex, signatures)
          )
        )}

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
