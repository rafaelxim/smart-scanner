import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type RootTabParamList = {
  Upload: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type UploadState = "idle" | "uploading" | "success" | "error";

function UploadScreen() {
  const insets = useSafeAreaInsets();
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

    const formData = new FormData();
    formData.append("receipt", {
      uri: selectedImage.uri,
      name: selectedImage.fileName ?? `receipt-${Date.now()}.jpg`,
      type: selectedImage.mimeType ?? "image/jpeg",
    } as unknown as Blob);

    try {
      const response = await fetch(`${apiBaseUrl}/receipts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      setUploadState("success");
      setMessage("Receipt uploaded successfully.");
    } catch (error) {
      setUploadState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed. Check the backend connection.",
      );
    }
  }

  const isUploading = uploadState === "uploading";

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Smart Expense Scanner</Text>
          <Text style={styles.title}>Upload receipt</Text>
          <Text style={styles.subtitle}>
            Add a receipt image to start the OCR and classification flow.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Receipt image</Text>
          <Text style={styles.panelText}>
            Capture a receipt or choose one from your gallery, then upload it to
            the backend.
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
              <Ionicons name="image-outline" color="#64748b" size={28} />
              <Text style={styles.emptyUploadText}>No receipt image selected</Text>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              disabled={isUploading}
              onPress={chooseImage}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
                isUploading && styles.buttonDisabled,
              ]}
            >
              <Ionicons name="images-outline" color="#0f172a" size={18} />
              <Text style={styles.secondaryButtonText}>Gallery</Text>
            </Pressable>
            <Pressable
              disabled={isUploading}
              onPress={captureImage}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
                isUploading && styles.buttonDisabled,
              ]}
            >
              <Ionicons name="camera-outline" color="#0f172a" size={18} />
              <Text style={styles.secondaryButtonText}>Camera</Text>
            </Pressable>
          </View>

          <Pressable
            disabled={isUploading}
            onPress={uploadImage}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
              isUploading && styles.buttonDisabled,
            ]}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" color="#ffffff" size={18} />
                <Text style={styles.primaryButtonText}>Upload receipt</Text>
              </>
            )}
          </Pressable>

          {message ? (
            <View
              style={[
                styles.feedback,
                uploadState === "success" ? styles.successFeedback : styles.errorFeedback,
              ]}
            >
              <Text
                selectable
                style={[
                  styles.feedbackText,
                  uploadState === "success" ? styles.successText : styles.errorText,
                ]}
              >
                {message}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Receipts</Text>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            Saved receipt records will appear here after uploads are connected.
          </Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No receipts yet</Text>
          <Text style={styles.emptyText}>
            Uploaded receipts will show their category, extracted merchant, and
            total.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f766e",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  panelTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
  },
  panelText: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  emptyUpload: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 170,
  },
  emptyUploadText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  preview: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  previewImage: {
    aspectRatio: 4 / 3,
    backgroundColor: "#e2e8f0",
    width: "100%",
  },
  previewDetails: {
    padding: 12,
  },
  previewTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  previewText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 3,
  },
  feedback: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  successFeedback: {
    backgroundColor: "#ecfdf5",
    borderColor: "#99f6e4",
  },
  errorFeedback: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  successText: {
    color: "#047857",
  },
  errorText: {
    color: "#b91c1c",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  tabBar: {
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
