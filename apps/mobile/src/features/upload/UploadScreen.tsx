import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uploadReceiptImage } from "./api";
import type { RootStackParamList } from "../../application/navigation/types";
import { getErrorMessage } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { ErrorMessage } from "../../shared/components/ErrorMessage";
import { Screen } from "../../shared/components/Screen";
import { colors, radii, spacing, typography } from "../../shared/styles/tokens";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function chooseImage() {
    setUploadState("idle");
    setMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setUploadState("error");
      setMessage("Gallery access is required to choose a receipt image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  }

  async function captureImage() {
    setUploadState("idle");
    setMessage(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setUploadState("error");
      setMessage("Camera access is required to capture a receipt image.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  }

  async function uploadImage() {
    if (!selectedImage) {
      setUploadState("error");
      setMessage("Choose or capture a receipt image before uploading.");
      return;
    }

    setUploadState("uploading");
    setMessage(null);

    try {
      const extractedReceipt = await uploadReceiptImage({
        fileName: selectedImage.fileName,
        mimeType: selectedImage.mimeType,
        uri: selectedImage.uri,
      });

      setUploadState("success");
      setMessage("Receipt extracted successfully.");
      navigation.navigate("ReviewReceipt", extractedReceipt);
    } catch (error) {
      setUploadState("error");
      setMessage(getErrorMessage(error));
    }
  }

  const isUploading = uploadState === "uploading";

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Market Receipt Tracker</Text>
        <Text style={styles.title}>Upload receipt</Text>
        <Text style={styles.subtitle}>
          Capture a market receipt or choose one from your gallery.
        </Text>
      </View>

      <Card>
        <Text style={styles.panelTitle}>Receipt image</Text>
        <Text style={styles.panelText}>
          The backend will receive this image and prepare it for extraction.
        </Text>

        {selectedImage ? (
          <View style={styles.preview}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <View style={styles.previewDetails}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedImage.fileName ?? "Receipt image"}
              </Text>
              <Text style={styles.previewText}>
                {selectedImage.width} x {selectedImage.height}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyUpload}>
            <Ionicons name="image-outline" color={colors.muted} size={28} />
            <Text style={styles.emptyUploadText}>No receipt image selected</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            disabled={isUploading}
            icon={<Ionicons name="images-outline" color={colors.text} size={18} />}
            onPress={chooseImage}
            variant="secondary"
          >
            Gallery
          </Button>
          <Button
            disabled={isUploading}
            icon={<Ionicons name="camera-outline" color={colors.text} size={18} />}
            onPress={captureImage}
            variant="secondary"
          >
            Camera
          </Button>
        </View>

        <Button
          icon={<Ionicons name="cloud-upload-outline" color={colors.surface} size={18} />}
          loading={isUploading}
          onPress={uploadImage}
        >
          Upload receipt
        </Button>

        {message ? (
          <ErrorMessage
            message={message}
            tone={uploadState === "success" ? "success" : "error"}
          />
        ) : null}
      </Card>
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
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  panelText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  emptyUpload: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 170,
  },
  emptyUploadText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  preview: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  previewImage: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
    width: "100%",
  },
  previewDetails: {
    padding: spacing.md,
  },
  previewTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  previewText: {
    color: colors.muted,
    fontSize: typography.eyebrow,
    marginTop: spacing.xs,
  },
});
