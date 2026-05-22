import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RootTabParamList = {
  Upload: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function UploadScreen() {
  return (
    <SafeAreaView style={styles.screen}>
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
          Camera and gallery actions will be connected in the upload pipeline.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Choose image</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Use camera</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function HistoryScreen() {
  return (
    <SafeAreaView style={styles.screen}>
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
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0f766e",
          tabBarInactiveTintColor: "#64748b",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen name="Upload" component={UploadScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    flex: 1,
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
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
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
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
