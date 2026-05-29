import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReceiptItemCategory } from "@smart-scanner/shared";
import { receiptItemCategories } from "@smart-scanner/shared";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { RootStackParamList } from "../../application/navigation/types";
import { Card } from "../../shared/components/Card";
import { Screen } from "../../shared/components/Screen";
import { colors, radii, spacing, typography } from "../../shared/styles/tokens";

type ReviewReceiptScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ReviewReceipt"
>;

interface EditableReceiptItem {
  id: string;
  originalName: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  category: ReceiptItemCategory;
}

export function ReviewReceiptScreen({ navigation, route }: ReviewReceiptScreenProps) {
  const { extractionId, receipt } = route.params;
  const [marketName, setMarketName] = useState(receipt.marketName ?? "");
  const [purchaseDate, setPurchaseDate] = useState(receipt.purchaseDate ?? "");
  const [officialTotal, setOfficialTotal] = useState(
    formatCentsInput(receipt.officialTotalAmountCents),
  );
  const [items, setItems] = useState<EditableReceiptItem[]>(() =>
    receipt.items.map((item, index) => ({
      id: `${extractionId}-${index}`,
      originalName: item.originalName,
      quantity: item.quantity === null ? "" : String(item.quantity),
      unit: item.unit ?? "",
      unitPrice: formatCentsInput(item.unitPriceAmountCents),
      total: formatCentsInput(item.totalAmountCents),
      category: item.category,
    })),
  );

  const officialTotalCents = parseMoneyInput(officialTotal);
  const itemTotalCents = useMemo(
    () =>
      items.reduce((sum, item) => {
        return sum + (parseMoneyInput(item.total) ?? 0);
      }, 0),
    [items],
  );
  const hasMismatch =
    officialTotalCents !== null && officialTotalCents !== itemTotalCents;

  function updateItem(id: string, changes: Partial<EditableReceiptItem>) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" color={colors.text} size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Review extraction</Text>
          <Text style={styles.title}>Confirm receipt data</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Receipt</Text>
        <Field
          label="Market name"
          onChangeText={setMarketName}
          placeholder="Market name"
          value={marketName}
        />
        <Field
          label="Purchase date"
          onChangeText={setPurchaseDate}
          placeholder="YYYY-MM-DD"
          value={purchaseDate}
        />
        <Field
          keyboardType="decimal-pad"
          label="Official total"
          onChangeText={setOfficialTotal}
          placeholder="0.00"
          value={officialTotal}
        />
      </Card>

      <View style={styles.totalPanel}>
        <View>
          <Text style={styles.totalLabel}>Items total</Text>
          <Text style={styles.totalValue}>{formatCentsDisplay(itemTotalCents)}</Text>
        </View>
        {officialTotalCents !== null ? (
          <View style={styles.totalRight}>
            <Text style={styles.totalLabel}>Official total</Text>
            <Text style={styles.totalValue}>{formatCentsDisplay(officialTotalCents)}</Text>
          </View>
        ) : null}
      </View>

      {hasMismatch ? (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" color={colors.danger} size={18} />
          <Text style={styles.warningText}>
            Official total differs from the sum of item totals.
          </Text>
        </View>
      ) : null}

      <View style={styles.itemsHeader}>
        <Text style={styles.sectionTitle}>Items</Text>
        <Text style={styles.itemCount}>{items.length} rows</Text>
      </View>

      {items.map((item, index) => (
        <Card key={item.id}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle}>Item {index + 1}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>

          <Field
            label="Product name"
            onChangeText={(value) => updateItem(item.id, { originalName: value })}
            placeholder="Product name"
            value={item.originalName}
          />

          <View style={styles.itemGrid}>
            <Field
              keyboardType="decimal-pad"
              label="Quantity"
              onChangeText={(value) => updateItem(item.id, { quantity: value })}
              placeholder="1"
              style={styles.gridField}
              value={item.quantity}
            />
            <Field
              label="Unit"
              onChangeText={(value) => updateItem(item.id, { unit: value })}
              placeholder="un"
              style={styles.gridField}
              value={item.unit}
            />
          </View>

          <View style={styles.itemGrid}>
            <Field
              keyboardType="decimal-pad"
              label="Unit price"
              onChangeText={(value) => updateItem(item.id, { unitPrice: value })}
              placeholder="0.00"
              style={styles.gridField}
              value={item.unitPrice}
            />
            <Field
              keyboardType="decimal-pad"
              label="Total"
              onChangeText={(value) => updateItem(item.id, { total: value })}
              placeholder="0.00"
              style={styles.gridField}
              value={item.total}
            />
          </View>

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <View style={styles.categoryRow}>
              {receiptItemCategories.map((category) => {
                const isSelected = item.category === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => updateItem(item.id, { category })}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Card>
      ))}
    </Screen>
  );
}

interface FieldProps {
  keyboardType?: "default" | "decimal-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  style?: object;
  value: string;
}

function Field({
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  style,
  value,
}: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function formatCentsInput(value: number | null): string {
  if (value === null) {
    return "";
  }

  return (value / 100).toFixed(2);
}

function formatCentsDisplay(value: number): string {
  return `R$ ${(value / 100).toFixed(2)}`;
}

function parseMoneyInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  categoryChipTextSelected: {
    color: colors.surface,
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  categoryScroll: {
    marginTop: -spacing.xs,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.eyebrow,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  gridField: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  itemCategory: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  itemCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  itemGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  itemTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  totalPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  warning: {
    alignItems: "center",
    backgroundColor: colors.dangerBackground,
    borderColor: colors.dangerBorder,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  warningText: {
    color: colors.danger,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
