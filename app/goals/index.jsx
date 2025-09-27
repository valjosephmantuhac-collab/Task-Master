import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [menuVisibleId, setMenuVisibleId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'goals'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(list);
    });

    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'goals', id);
              await deleteDoc(docRef);
            } catch (error) {
              console.log('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };

  const handleComplete = async (id, currentProgress) => {
    try {
      const docRef = doc(db, 'goals', id);
      await updateDoc(docRef, {
        previousProgress: currentProgress ?? 0,
        progress: 100,
        completed: true,
      });
    } catch (error) {
      console.log('Error marking complete:', error);
    }
  };

  const handleUndo = async (id, previousProgress) => {
    try {
      const docRef = doc(db, 'goals', id);
      await updateDoc(docRef, {
        progress: previousProgress ?? 0,
        completed: false,
        previousProgress: null,
      });
    } catch (error) {
      console.log('Error undoing task:', error);
    }
  };

  const getSubjectSummary = () => {
    const summary = {};
    goals.forEach((goal) => {
      const subject = goal.subject || 'Other';
      summary[subject] = (summary[subject] || 0) + 1;
    });
    return summary;
  };

  const ProgressBar = ({ progress = 0 }) => {
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: progress ?? 0,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }, [progress, widthAnim]);

    const widthInterpolate = widthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[styles.progressBarFill, { width: widthInterpolate }]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="grid-outline" size={18} color="#144272" />
          <Text style={[styles.summaryTitle, { marginLeft: 6 }]}>Categories</Text>
        </View>

        <View style={styles.gridContainer}>
          {Object.entries(getSubjectSummary()).map(([subject, count]) => (
            <View key={subject} style={styles.categoryBadge}>
              <Ionicons name="pricetags-outline" size={16} color="#144272" />
              <Text style={styles.categoryText}>
                {subject} ({count})
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.goalItem,
              item.completed && { opacity: 0.6 },
            ]}
          >
            {/* Title & Menu */}
            <View style={styles.goalHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.goalText,
                    item.completed && {
                      textDecorationLine: 'line-through',
                      color: '#6B7280',
                    },
                  ]}
                >
                  {item.title || 'Untitled Task'}
                </Text>
                {item.description ? (
                  <Text style={styles.goalNotes} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <View style={[
                styles.priorityBadge,
                item.priority === 'high' && { backgroundColor: '#0A2647' },
                item.priority === 'medium' && { backgroundColor: '#1E90FF' },
                item.priority === 'low' && { backgroundColor: '#BFD7ED' },
              ]}>
                <Text style={styles.priorityBadgeText}>{item.priority}</Text>
              </View>

              <Pressable
                onPress={() =>
                  setMenuVisibleId(menuVisibleId === item.id ? null : item.id)
                }
              >
                <Ionicons name="ellipsis-vertical" size={22} color="#0A2540" />
              </Pressable>
            </View>

            {/* Dropdown Menu */}
            {menuVisibleId === item.id && (
              <View style={styles.menuDropdown}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisibleId(null);
                    router.push(`/goals/edit/${item.id}`);
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color="#1E90FF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.menuItemText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisibleId(null);
                    handleDelete(item.id);
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color="#FF4D4D"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.menuItemText, { color: '#FF4D4D' }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Progress */}
            <Text style={styles.progressText}>
              Progress: {item.progress ?? 0}%
            </Text>
            <ProgressBar progress={item.progress ?? 0} />

            {/* Complete Button */}
            <Pressable
              style={[
                styles.completeButton,
                { backgroundColor: item.completed ? '#0A2647' : '#1E90FF' },
              ]}
              onPress={() =>
                item.completed
                  ? handleUndo(item.id, item.previousProgress)
                  : handleComplete(item.id, item.progress)
              }
            >
              <Ionicons
                name={
                  item.completed
                    ? 'refresh-outline'
                    : 'checkmark-circle-outline'
                }
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.completeButtonText}>
                {item.completed ? 'Undo' : 'Complete'}
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
        }
      />

      {/* Logout */}
      <Pressable style={styles.logoutButton} onPress={() => signOut(auth)}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0A2647',
    marginTop: 10,
  },

  // Summary
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#144272',
  },

  // Task Card
  goalItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2647',
  },
  goalNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Priority
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },

  // Progress
  progressText: {
    fontSize: 14,
    color: '#1E90FF',
    marginBottom: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#1E90FF',
  },

  // Buttons
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Menu
  menuDropdown: {
    position: 'absolute',
    top: 34,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    width: 120,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A2540',
  },

  // Empty state
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Logout
  logoutButton: {
    backgroundColor: '#0A2647',
    margin: 20,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
