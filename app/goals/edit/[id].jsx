import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const TAGS = ["Work", "Personal", "Shopping", "Other"];

const EditGoal = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // ⬅ added state
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState("low");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const docRef = doc(db, "goals", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description || ""); // ⬅ prefill desc
          setProgress(data.progress ?? 0);
          setPriority(data.priority || "low");

          if (TAGS.includes(data.subject)) {
            setSubject(data.subject);
          } else {
            setSubject("Other");
            setCustomSubject(data.subject || "");
          }
        }
      } catch (error) {
        console.log("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "goals", id);
      const finalSubject =
        subject === "Other" ? customSubject.trim() || "Other" : subject;
      await updateDoc(docRef, {
        title,
        description, // ⬅ update desc too
        progress: Number(progress),
        priority,
        subject: finalSubject,
        completed: Number(progress) === 100,
      });
      Keyboard.dismiss();
      router.push("/goals");
    } catch (error) {
      console.log("Error updating task:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#144272" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Edit Task</Text>

      {/* Task Title */}
      <View style={styles.card}>
        <Ionicons
          name="document-text-outline"
          size={20}
          color="#144272"
          style={styles.cardIcon}
        />
        <TextInput
          style={styles.titleInput}
          placeholder="Task Title"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Description Section */}
      <View style={styles.card}>
        <Ionicons
          name="chatbox-ellipses-outline"
          size={20}
          color="#144272"
          style={styles.cardIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Add a description"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {/* Progress Section */}
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Ionicons name="analytics-outline" size={18} color="#144272" />
          <Text style={styles.sectionLabel}>Progress: {progress}%</Text>
        </View>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progress}
          minimumTrackTintColor="#21cc8d"
          maximumTrackTintColor="#E2E8F0"
          thumbTintColor="#144272"
          onValueChange={(val) => setProgress(val)}
        />
      </View>

      {/* Tags Section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          marginBottom: 8,
        }}
      >
        <Ionicons name="pricetags-outline" size={18} color="#144272" />
        <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Tags</Text>
      </View>
      <View style={styles.chipsRow}>
        {TAGS.map((tag) => {
          const selected = subject === tag;
          return (
            <Pressable
              key={tag}
              onPress={() => setSubject(tag)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Ionicons
                name={selected ? "pricetag" : "pricetag-outline"}
                size={16}
                color={selected ? "#fff" : "#144272"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {subject === "Other" && (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Ionicons
            name="pencil-outline"
            size={20}
            color="#144272"
            style={styles.cardIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Custom tag name"
            placeholderTextColor="#9AA5B1"
            value={customSubject}
            onChangeText={setCustomSubject}
          />
        </View>
      )}

      {/* Priority Section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 18,
          marginBottom: 8,
        }}
      >
        <Ionicons name="flag-outline" size={18} color="#144272" />
        <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Priority</Text>
      </View>

      <View style={styles.segmentedContainer}>
        {["low", "medium", "high"].map((level) => {
          const active = priority === level;
          const icon =
            level === "low"
              ? "ellipse-outline"
              : level === "medium"
              ? "remove-outline"
              : "flame-outline";
          return (
            <Pressable
              key={level}
              onPress={() => setPriority(level)}
              style={({ pressed }) => [
                styles.segment,
                active && styles.segmentActive,
                pressed && styles.segmentPressed,
              ]}
            >
              <Ionicons
                name={icon}
                size={18}
                color={active ? "#fff" : "#144272"}
              />
              <Text
                style={[
                  styles.segmentText,
                  active && styles.segmentTextActive,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Update Button */}
      <Pressable
        onPress={handleUpdate}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="checkmark" size={20} color="#fff" />
        <Text style={styles.fabText}> Update Task</Text>
      </Pressable>
    </ScrollView>
  );
};

export default EditGoal;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0A2647",
    marginBottom: 14,
    marginTop: 10,
    textAlign: "center",
  },

  // Card inputs
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E6EEF9",
  },
  cardIcon: { marginRight: 12 },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2647",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0A2647",
    textAlignVertical: "top", // ⬅ makes multiline start at top
  },

  // section labels
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#144272",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  // chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6EEF9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chipSelected: { backgroundColor: "#144272", borderColor: "#144272" },
  chipPressed: { opacity: 0.9 },
  chipText: {
    color: "#144272",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  chipTextSelected: { color: "#fff" },

  // segmented priority
  segmentedContainer: {
    flexDirection: "row",
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  segmentActive: { backgroundColor: "#144272" },
  segmentPressed: { opacity: 0.9 },
  segmentText: {
    marginLeft: 8,
    color: "#144272",
    textTransform: "capitalize",
    fontWeight: "600",
  },
  segmentTextActive: { color: "#fff" },

  // FAB
  fab: {
    marginTop: 30,
    borderRadius: 30,
    backgroundColor: "#0A2647",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
  fabPressed: { opacity: 0.9 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
