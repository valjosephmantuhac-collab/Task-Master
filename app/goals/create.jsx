import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGoals } from '../../hooks/useGoals'
import { useRouter } from 'expo-router'
import { auth } from '../../firebaseConfig'
import { Ionicons } from '@expo/vector-icons'

const TAGS = ['Work', 'Personal', 'Shopping', 'Other']

export default function Create() {
  const [goal, setGoal] = useState('')
  const [priority, setPriority] = useState('low')
  const [subject, setSubject] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [notes, setNotes] = useState('')
  const { createGoal } = useGoals()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!goal.trim()) return

    const finalSubject =
      subject === 'Other'
        ? customSubject.trim() || 'Other'
        : subject || 'Other'

    await createGoal({
      title: goal,
      subject: finalSubject,
      notes: notes.trim() || null,
      progress: 0,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      priority: priority,
    })

    setGoal('')
    setPriority('low')
    setSubject('')
    setCustomSubject('')
    setNotes('')
    Keyboard.dismiss()
    router.push('/goals')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
      
        

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Page Title */}
          <Text style={styles.pageTitle}>New Task</Text>

          {/* Live Preview */}
          <View style={styles.preview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {goal.trim() || 'Task title'}
              </Text>
              <View style={[styles.priorityPill, priority === 'high' && styles.priorityHigh]}>
                <Text style={styles.priorityText}>{priority}</Text>
              </View>
            </View>
            <Text style={styles.previewSubtitle} numberOfLines={2}>
              {notes.trim() || 'Description'}
            </Text>
            <View style={styles.previewTags}>
              <View style={styles.tagMini}>
                <Ionicons name="pricetag-outline" size={12} color="#144272" />
                <Text style={styles.tagMiniText}>
                  {subject || 'No tag'}
                </Text>
              </View>
            </View>
          </View>

          {/* Title Input (big) */}
          <View style={styles.card}>
            <Ionicons name="document-text-outline" size={20} color="#144272" style={styles.cardIcon} />
            <TextInput
              style={styles.titleInput}
              placeholder="Task Title"
              placeholderTextColor="#9AA5B1"
              value={goal}
              onChangeText={setGoal}
              returnKeyType="done"
              accessibilityLabel="Task title"
            />
          </View>

          {/* Notes */}
          <View style={styles.card}>
            
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Add notes or description"
              placeholderTextColor="#9AA5B1"
              value={notes}
              onChangeText={setNotes}
              multiline
              accessibilityLabel="Notes"
            />
          </View>

          {/* Tags */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 8 }}>
            <Ionicons name="pricetags-outline" size={18} color="#144272" />
            <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Tags</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {TAGS.map((tag) => {
              const selected = subject === tag
              return (
                <Pressable
                  key={tag}
                  onPress={() => setSubject(tag)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Ionicons
                    name={selected ? "pricetag" : "pricetag-outline"}
                    size={16}
                    color={selected ? '#fff' : '#144272'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {tag}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Custom subject input appears when Other selected */}
          {subject === 'Other' && (
            <View style={[styles.card, { marginTop: 12 }]}>
              <Ionicons name="pencil-outline" size={20} color="#144272" style={styles.cardIcon} />
              <TextInput
                style={styles.input}
                placeholder="Custom tag name"
                placeholderTextColor="#9AA5B1"
                value={customSubject}
                onChangeText={setCustomSubject}
                accessibilityLabel="Custom tag"
              />
            </View>
          )}

          {/* Priority */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
            <Ionicons name="flag-outline" size={18} color="#144272" />
            <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Priority</Text>
          </View>

          <View style={styles.segmentedContainer}>
            {['low', 'medium', 'high'].map((level) => {
              const active = priority === level
              const icon =
                level === 'low' ? 'ellipse-outline' : level === 'medium' ? 'remove-outline' : 'flame-outline'
              return (
                <Pressable
                  key={level}
                  onPress={() => setPriority(level)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.segment,
                    active && styles.segmentActive,
                    pressed && styles.segmentPressed,
                  ]}
                >
                  <Ionicons name={icon} size={18} color={active ? '#fff' : '#144272'} />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {level}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          {/* bottom spacing so FAB doesn't cover content */}
          <View style={{ height: 96 }} />
        </ScrollView>

        {/* Floating Save FAB */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save task"
          accessibilityHint="Saves the task and returns to goals"
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.fabText}> Save Task</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0A2647', },

  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },

  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0A2647',
    marginBottom: 14,
    marginTop: 10,
  },

  preview: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#0A2647', maxWidth: '78%' },
  previewSubtitle: { marginTop: 8, color: '#4B6478', fontSize: 13 },
  previewTags: { marginTop: 12, flexDirection: 'row' },
  tagMini: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagMiniText: { marginLeft: 6, color: '#144272', fontSize: 12 },

  priorityPill: {
    backgroundColor: '#E6EEF9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityHigh: { backgroundColor: '#FFDDE0' },
  priorityText: { color: '#144272', fontWeight: '600', textTransform: 'capitalize' },

  // Card inputs
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { marginRight: 12 },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2647',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0A2647',
  },

  // chips
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#144272',
  },
  chipsRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EEF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chipSelected: { backgroundColor: '#144272', borderColor: '#144272' },
  chipPressed: { opacity: 0.9 },
  chipText: { color: '#144272', fontWeight: '600', textTransform: 'capitalize' },
  chipTextSelected: { color: '#fff' },

  // segmented
  segmentedContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  segmentActive: { backgroundColor: '#144272' },
  segmentPressed: { opacity: 0.9 },
  segmentText: { marginLeft: 8, color: '#144272', textTransform: 'capitalize', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 22,
    left: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A2647',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  fabPressed: { opacity: 0.9 },
})
