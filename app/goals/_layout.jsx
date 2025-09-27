import { Tabs } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { GoalsProvider } from '../../contexts/GoalsContext';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function GoalsLayout() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/auth/login");
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0A2647" />
      </View>
    );
  }

  return (
    <GoalsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0A2647",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: "#F8FAFC",
            borderTopWidth: 0,
            elevation: 10,
            height: 65,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        {/* Home / Your Tasks */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Tasks",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={24}
                color={focused ? "#0A2647" : "#94A3B8"}
              />
            ),
          }}
        />

        {/* Create Task */}
        <Tabs.Screen
          name="create"
          options={{
            title: "Add Task",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={24}
                color={focused ? "#0A2647" : "#94A3B8"}
              />
            ),
          }}
        />

        {/* Hidden Edit Task */}
        <Tabs.Screen name="edit/[id]" options={{ href: null, }} />
      </Tabs>
    </GoalsProvider>
  );
}
