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
  Alert,
  Dimensions
} from 'react-native';
import { TestTube2, Upload, CheckCircle, Clock, AlertTriangle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function TestsScreen() {
  const { user, API_URL } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient/test-recommendations`, {
           headers: { 'Authorization': `Bearer ${user?.token || ''}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (e) {
        console.error("Failed to fetch test recommendations:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const urgencyStyles: Record<string, { bg: string; color: string; border: string }> = {
    Routine: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    Urgent: { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
    Emergency: { bg: '#fff1f2', color: '#e11d48', border: '#ffe4e6' },
  };

  const handleSimulateUpload = async (rec: any) => {
    setUploadingId(rec._id);
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/patient/test-recommendations`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token || ''}`
          },
          body: JSON.stringify({ id: rec._id, status: 'done' })
        });

        if (res.ok) {
          setRecommendations(prev =>
            prev.map(r => r._id === rec._id ? { ...r, status: 'done' } : r)
          );
          Alert.alert("Success", "Test results uploaded successfully.");
        }
      } catch (e) {
        Alert.alert("Error", "Failed to update test status.");
      } finally {
        setUploadingId(null);
      }
    }, 2000);
  };

  const renderTestCard = (rec: any, isPending: boolean) => (
    <View key={rec._id} style={[styles.testCard, !isPending && styles.doneCard]}>
      <View style={styles.cardHeader}>
          <View style={styles.testInfo}>
              <Text style={styles.testName}>{rec.testName}</Text>
              <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Ordered by Dr. {rec.doctorId?.name}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{formatDate(rec.createdAt)}</Text>
              </View>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyles[rec.urgency || 'Routine'].bg, borderColor: urgencyStyles[rec.urgency || 'Routine'].border }]}>
            <Text style={[styles.urgencyText, { color: urgencyStyles[rec.urgency || 'Routine'].color }]}>
              {(rec.urgency || 'Routine').toUpperCase()}
            </Text>
          </View>
      </View>

      {rec.notes && <Text style={styles.notesText}>{rec.notes}</Text>}

      {isPending ? (
        <TouchableOpacity 
          style={styles.uploadBtn}
          onPress={() => handleSimulateUpload(rec)}
          disabled={!!uploadingId}
        >
          {uploadingId === rec._id ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <>
              <Upload size={18} color="#059669" strokeWidth={2.5} />
              <Text style={styles.uploadBtnText}>Upload Result</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.doneLabel}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.doneText}>COMPLETED & VERIFIED</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
            colors={['#1e1b4b', '#312e81']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lab Tests</Text>
                <ShieldCheck size={20} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.headerSub}>
                Formal test recommendations from your clinical history.
            </Text>
            <View style={styles.flare} />
        </LinearGradient>

        <View style={styles.body}>
            {loading ? (
                <View style={{ padding: 40 }}>
                    <ActivityIndicator color="#4f46e5" />
                </View>
            ) : recommendations.length === 0 ? (
                <View style={styles.emptyBox}>
                    <TestTube2 size={48} color="#cbd5e1" strokeWidth={1} />
                    <Text style={styles.emptyTitle}>No recommended tests</Text>
                    <Text style={styles.emptySub}>Your dashboard is clear. All necessary tests are up to date.</Text>
                </View>
            ) : (
                <View>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Sparkles size={18} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>Recommendations</Text>
                        </View>
                        {recommendations.filter(r => r.status !== 'done').map(r => renderTestCard(r, true))}
                    </View>

                    {recommendations.filter(r => r.status === 'done').length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <CheckCircle size={18} color="#10b981" />
                                <Text style={styles.sectionTitle}>Archive</Text>
                            </View>
                            {recommendations.filter(r => r.status === 'done').map(r => renderTestCard(r, false))}
                        </View>
                    )}
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
    backgroundColor: '#F8FAFC',
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
    marginTop: 4,
  },
  flare: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 75,
  },
  body: {
    padding: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  doneCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  notesText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    fontWeight: '500',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  doneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 4,
  },
  doneText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: 1,
  },
  emptyBox: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
