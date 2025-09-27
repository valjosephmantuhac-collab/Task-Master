import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setLoading(false);
      }
    });

    if (auth.currentUser) {
      const q = query(
        collection(db, "goals"),
        where("userId", "==", auth.currentUser.uid)
      );
      const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(list);
      });

      return () => {
        unsubscribeAuth();
        unsubscribeFirestore();
      };
    }
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A2647" />
      </View>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <Animated.View style={[styles.heroContainer, { opacity: fadeAnim }]}>
        <Text style={styles.greeting}>Good Day,</Text>
        <Text style={styles.userName}>Sir!</Text>
        <Text style={styles.heroSubtitle}>Here’s your dashboard overview</Text>
      </Animated.View>

      {/* Summary Cards */}
      <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
        <View style={[styles.card, { backgroundColor: "#144272" }]}>
          <Ionicons name="list-outline" size={24} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Total Tasks</Text>
            <Text style={styles.cardCount}>{totalTasks}</Text>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: "#21cc8d" }]}>
          <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>Completed</Text>
            <Text style={styles.cardCount}>{completedTasks}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#0A2647" }]}
          onPress={() => router.push("/goals/create")}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Add Task</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#144272" }]}
          onPress={() => router.push("/goals")}
        >
          <Ionicons name="list-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>View Tasks</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "500",
    color: "#0A2647",
  },
  userName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#144272",
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 6,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  cardCount: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "800",
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});
