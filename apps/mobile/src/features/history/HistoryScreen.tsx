import { StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../shared/components/EmptyState";
import { Screen } from "../../shared/components/Screen";
import { colors, spacing, typography } from "../../shared/styles/tokens";

export function HistoryScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Receipts</Text>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Saved receipt records will appear here after uploads are connected.
        </Text>
      </View>

      <EmptyState title="No receipts yet">
        Uploaded receipts will show their category, extracted merchant, and total.
      </EmptyState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.eyebrow,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.subtitle,
    lineHeight: 23,
  },
});
