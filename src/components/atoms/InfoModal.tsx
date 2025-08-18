import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView } from 'react-native';
import RoundedButton from './RoundedButton';

export interface InfoModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  markdown?: boolean;
}

export default function InfoModal({
  visible,
  title,
  content,
  onClose,
  markdown = false,
}: InfoModalProps) {
  // Very small markdown-ish renderer: supports **bold**, bullet/numbered lists, and line breaks
  const renderInline = (text: string) => {
    // Split by **...** to toggle bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text style={styles.content}>
        {parts.map((part, idx) => {
          const m = part.match(/^\*\*([^*]+)\*\*$/);
          if (m) {
            return (
              <Text key={idx} style={[styles.content, styles.bold]}>
                {m[1]}
              </Text>
            );
          }
          return (
            <Text key={idx} style={styles.content}>
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderMarkdown = (md: string) => {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Empty line -> spacer
      if (/^\s*$/.test(line)) {
        elements.push(<View key={`sp-${i}`} style={{ height: 8 }} />);
        i += 1;
        continue;
      }
      // Unordered list item: -, *, •
      const ulMatch = line.match(/^\s*[\-*•]\s+(.*)$/);
      if (ulMatch) {
        const items: string[] = [];
        let j = i;
        while (j < lines.length) {
          const m = lines[j].match(/^\s*[\-*•]\s+(.*)$/);
          if (!m) break;
          items.push(m[1]);
          j += 1;
        }
        elements.push(
          <View key={`ul-${i}`} style={{ marginBottom: 6 }}>
            {items.map((it, idx) => (
              <View key={`uli-${i}-${idx}`} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <View style={{ flex: 1 }}>{renderInline(it)}</View>
              </View>
            ))}
          </View>,
        );
        i = j;
        continue;
      }
      // Ordered list item: 1. 2. etc
      const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (olMatch) {
        const items: { n: number; t: string }[] = [];
        let j = i;
        while (j < lines.length) {
          const m = lines[j].match(/^\s*(\d+)\.\s+(.*)$/);
          if (!m) break;
          items.push({ n: parseInt(m[1], 10), t: m[2] });
          j += 1;
        }
        elements.push(
          <View key={`ol-${i}`} style={{ marginBottom: 6 }}>
            {items.map((it, idx) => (
              <View key={`oli-${i}-${idx}`} style={styles.listItem}>
                <Text style={styles.number}>{`${it.n}.`}</Text>
                <View style={{ flex: 1 }}>{renderInline(it.t)}</View>
              </View>
            ))}
          </View>,
        );
        i = j;
        continue;
      }
      // Paragraph: accumulate until blank line or list start
      const para: string[] = [line];
      let j = i + 1;
      while (
        j < lines.length &&
        !/^\s*$/.test(lines[j]) &&
        !/^\s*[\-*•]\s+/.test(lines[j]) &&
        !/^\s*\d+\.\s+/.test(lines[j])
      ) {
        para.push(lines[j]);
        j += 1;
      }
      elements.push(
        <Text key={`p-${i}`} style={[styles.content, styles.paragraph]}>
          {renderInline(para.join('\n'))}
        </Text>,
      );
      i = j;
    }
    return <View>{elements}</View>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={{ maxHeight: 280 }}>
            {markdown ? (
              renderMarkdown(content)
            ) : (
              <Text style={styles.content}>{content}</Text>
            )}
          </ScrollView>
          <View style={{ height: 12 }} />
          <RoundedButton title="Got it" onPress={onClose} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  content: { color: '#cbd5e1', lineHeight: 20 },
  bold: { fontWeight: '800', color: '#e5e7eb' },
  paragraph: { marginBottom: 6 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bullet: { color: '#cbd5e1', width: 16 },
  number: { color: '#cbd5e1', width: 22, textAlign: 'right', marginRight: 6 },
});
