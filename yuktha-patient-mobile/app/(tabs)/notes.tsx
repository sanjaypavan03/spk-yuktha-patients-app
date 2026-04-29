import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { MessageSquare, User, FileText, AlertTriangle, ArrowLeft, Heart, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function NotesScreen() {
  const { user, API_URL } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient/clinical-notes`, {
            headers: { 'Authorization': `Bearer ${user?.token || ''}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch (e) {
        console.error("Failed to fetch notes:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const borderMap: Record<string, string> = {
    discharge: '#F43F5E',
    advice: '#10B981',
    general: '#6366F1',
  };

  const labelMap: Record<string, { text: string; color: string; bg: string }> = {
    discharge: { text: 'Discharge Summary', color: '#E11D48', bg: '#FFF1F2' },
    advice: { text: "Doctor's Advice", color: '#059669', bg: '#ECFDF5' },
    general: { text: 'Clinical Note', color: '#4338CA', bg: '#EEF2FF' },
  };

  const renderSection = (title: string, sectionNotes: any[]) => {
    if (sectionNotes.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.list}>
          {sectionNotes.map(note => (
            <View key={note._id} style={[styles.noteCard, { borderLeftColor: borderMap[note.noteType || 'general'] }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: labelMap[note.noteType || 'general'].bg }]}>
                  <Text style={[styles.badgeText, { color: labelMap[note.noteType || 'general'].color }]}>
                    {labelMap[note.noteType || 'general'].text}
                  </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(note.createdAt)}</Text>
              </View>
              <Text style={styles.contentText}>{note.content}</Text>
              <View style={styles.doctorInfo}>
                <View style={styles.doctorAvatar}>
                  <User size={14} color="#059669" />
                </View>
                <View>
                  <Text style={styles.doctorName}>Dr. {note.doctorId?.name}</Text>
                  <Text style={styles.doctorSpecialty}>{note.doctorId?.specialty || 'Medical Specialist'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Clinical Notes</Text>
                <Sparkles size={20} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.headerSub}>
                Digital signatures and formal advice recorded during your consultations.
            </Text>
            <View style={styles.flare} />
        </LinearGradient>

        <View style={styles.body}>
            {loading ? (
                <View style={{ padding: 40 }}>
                    <ActivityIndicator color="#10B981" />
                </View>
            ) : notes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBox}>
                        <MessageSquare size={48} color="#CBD5E1" />
                    </View>
                    <Text style={styles.emptyTitle}>No notes recorded</Text>
                    <Text style={styles.emptySubtitle}>Clinical notes and advice will appear here after your next visit.</Text>
                </View>
            ) : (
                <View>
                    {renderSection("Discharge Summaries", notes.filter(n => n.noteType === 'discharge'))}
                    {renderSection("Doctor's Advice", notes.filter(n => !n.noteType || n.noteType === 'advice'))}
                    {renderSection("General Notes", notes.filter(n => n.noteType === 'general'))}
                </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: '85%',
  },
  flare: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 70,
  },
  body: {
    padding: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  dateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  contentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 20,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  doctorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  doctorSpecialty: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CBD5E1',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
