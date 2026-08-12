import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { textStyles } from '../../constants/typography';
import { spacing, radius } from '../../constants/tokens';
import Button from '../../components/common/Button';

interface PollComposerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSend: (question: string, options: string[]) => void;
}

const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

export default function PollComposerSheet({ visible, onClose, onSend }: PollComposerSheetProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
  const hasDuplicates = new Set(cleanedOptions.map((o) => o.toLowerCase())).size !== cleanedOptions.length;
  const canSend = question.trim().length > 0 && cleanedOptions.length >= MIN_OPTIONS && !hasDuplicates;

  const handleSend = () => {
    if (!canSend) return;
    onSend(question.trim(), cleanedOptions);
    setQuestion('');
    setOptions(['', '']);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Create a Poll</Text>

          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="e.g. Is it red, yellow, or green?"
            placeholderTextColor={colors.text.disabled}
            style={styles.questionInput}
            maxLength={140}
          />

          {options.map((opt, i) => (
            <View key={i} style={styles.optionRow}>
              <TextInput
                value={opt}
                onChangeText={(v) => updateOption(i, v)}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor={colors.text.disabled}
                style={styles.optionInput}
                maxLength={40}
              />
              {options.length > MIN_OPTIONS && (
                <Pressable onPress={() => removeOption(i)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}

          {options.length < MAX_OPTIONS && (
            <Pressable onPress={addOption} style={styles.addOption}>
              <Text style={styles.addOptionText}>+ Add option</Text>
            </Pressable>
          )}

          {hasDuplicates && <Text style={styles.errorText}>Options must be unique</Text>}

          <Button label="Send Poll" onPress={handleSend} disabled={!canSend} style={styles.sendBtn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg.surfaceRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border.strong,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...textStyles.title, color: colors.text.primary, marginBottom: spacing.xs },
  questionInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  optionInput: {
    flex: 1,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
  },
  removeBtn: { padding: spacing.xs },
  removeBtnText: { color: colors.text.disabled },
  addOption: { paddingVertical: spacing.xs },
  addOptionText: { ...textStyles.small, color: colors.accent.secondary },
  errorText: { ...textStyles.caption, color: colors.state.error },
  sendBtn: { marginTop: spacing.sm },
});