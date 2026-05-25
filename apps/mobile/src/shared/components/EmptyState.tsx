import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../styles/tokens";

interface EmptyStateProps {
  children: ReactNode;
  title: string;
}

export function EmptyState({ children, title }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
  },
});
