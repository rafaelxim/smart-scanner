import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../styles/tokens";

interface ErrorMessageProps {
  message: string;
  tone?: "error" | "success";
}

export function ErrorMessage({ message, tone = "error" }: ErrorMessageProps) {
  const isSuccess = tone === "success";

  return (
    <View style={[styles.feedback, isSuccess ? styles.success : styles.error]}>
      <Text selectable style={[styles.text, isSuccess ? styles.successText : styles.errorText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  feedback: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  success: {
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
  },
  error: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.dangerBorder,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  successText: {
    color: colors.primaryDark,
  },
  errorText: {
    color: colors.danger,
  },
});
