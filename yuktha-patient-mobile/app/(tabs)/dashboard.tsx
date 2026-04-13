import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  Platform, 
  ActivityIndicator, 
  Animated, 
  Easing 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { Pill, FileText, CheckCircle, Users, QrCode, Calendar, Bell, User, Check, X } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
    position: 'relative',
    zIndex: 100,
  },
  headerCard: {
    padding: 20,
    borderRadius: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 20,
  },
  headerFlare: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateStamp: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.32, // 0.12em exactly
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: -2,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
    color: '#FFF',
    marginTop: -2,
  },
  bellButton: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bellBackdrop: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // white/20 exactly
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // white/10 exactly
    marginTop: 10,
    zIndex: 10,
  },
  metricsBlur: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18, 
  },
  metricsLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#ECFDF5', // emerald-50
    letterSpacing: 1,
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  metricsValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  progressWrapper: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsPanel: {
    position: 'absolute',
    top: '100%',
    left: 24,
    right: 24,
    zIndex: 10,
  },
  notifBlur: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  notifHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.mutedForeground,
    letterSpacing: 1,
    marginBottom: 16,
  },
  notifList: {
    gap: 12,
  },
  notifItem: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: theme.isDarkMode ? 'rgba(251,113,133,0.1)' : 'rgba(251,113,133,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? 'rgba(251,113,133,0.2)' : 'rgba(251,113,133,0.1)',
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.isDarkMode ? '#450a0a' : '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.foreground,
  },
  notifSub: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  emptyNotif: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyNotifText: {
    fontSize: 14,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#0F172A', // slate-900
    letterSpacing: -0.2,
  },
  viewAll: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#059669', // emerald-600
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.foreground,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  cardEnd: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.foreground,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8', // slate-400
    letterSpacing: 0.5,
  },
  pillActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtnCheck: {
    width: 40,
    height: 40,
    backgroundColor: theme.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnX: {
    width: 40,
    height: 40,
    backgroundColor: theme.isDarkMode ? '#450a0a' : '#FFF1F2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adviceAvatarRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  adviceAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.foreground,
  },
  adviceSpec: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.mutedForeground,
    textTransform: 'uppercase',
  },
  adviceDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.mutedForeground,
  },
  adviceText: {
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 20,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 48) / 3,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B', // slate-800
    textAlign: 'center',
    marginTop: 2,
  },
  skeletonList: {
    gap: 16,
  },
  skeletonCard: {
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    opacity: 0.5,
  }
});

export default function DashboardPage() {
  const { user, token, isLoading, API_URL } = useAuth();
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();

  const [pills, setPills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<any>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;
  
  const [refillAlerts, setRefillAlerts] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);

  // Safety Gate: Ensure user is logged in
  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/');
    }
  }, [user, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const tzOffset = -(new Date().getTimezoneOffset());
        
        const fetchEndpoint = (path: string) => fetch(`${API_URL}${path}`, { headers }).catch(() => null);

        const [pillsRes, apptsRes, scoreRes, alertsRes, notesRes] = await Promise.all([
          fetchEndpoint(`/api/patient/pills/today?tzOffset=${tzOffset}`),
          fetchEndpoint('/api/appointments?date=today'),
          fetchEndpoint('/api/patient/health-score'),
          fetchEndpoint('/api/patient/refill-alerts'),
          fetchEndpoint('/api/patient/clinical-notes')
        ]);

        if (pillsRes?.ok) setPills((await pillsRes.json()).pills || []);
        if (apptsRes?.ok) setAppointments((await apptsRes.json()).appointments || []);
        if (scoreRes?.ok) setHealthScore(await scoreRes.json());
        if (alertsRes?.ok) setRefillAlerts((await alertsRes.json()).alerts || []);
        if (notesRes?.ok) setClinicalNotes((await notesRes.json()).notes || []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token, API_URL]);

  const toggleNotifications = () => {
    const toValue = showNotifications ? 0 : 1;
    setShowNotifications(!showNotifications);
    Animated.timing(notifAnim, {
      toValue,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const fetchHealthScore = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patient/health-score`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHealthScore(await res.json());
      }
    } catch (e) {
      console.error("Failed to refetch score", e);
    }
  };

  const handleToggleTaken = async (pillId: string, status: { taken?: boolean; skipped?: boolean }) => {
    // Optimistic UI update
    setPills(prev => prev.map(p => p._id === pillId ? { ...p, ...status } : p));
    
    try {
      const res = await fetch(`${API_URL}/api/patient/pills/${pillId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(status)
      });

      if (res.ok) {
        // Refetch everything to keep ring and schedule in sync
        fetchHealthScore();
      }
    } catch (e) {
      console.error("Dashboard toggle error", e);
    }
  };

  const getGreetings = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const adherence = healthScore?.score !== undefined ? healthScore.score : null;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent} 
            bounces={true}
      >
        {/* 1. Premium Emerald Gradient Header */}
        <View style={styles.headerWrapper}>
          <LinearGradient 
            colors={isDarkMode ? ['#065F46', '#064E3B'] : ['#10B981', '#059669']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTop}>
              <View style={{ zIndex: 10 }}>
                <Text style={styles.dateStamp}>
                  {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
                </Text>
                <Text style={styles.greetingTitle}>
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                </Text>
                <Text style={styles.userName}>
                  {user?.firstName || user?.name || 'Guest'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.bellButton}
                onPress={toggleNotifications}
              >
                <View style={styles.bellBackdrop}>
                  <Bell size={24} color="#FFF" strokeWidth={1.5} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsRow}>
              <BlurView intensity={20} style={styles.metricsBlur} tint="default">
                <View>
                  <Text style={styles.metricsLabel}>ADHERENCE</Text>
                  <Text style={styles.metricsValue}>{(healthScore?.score || 0)}%</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Svg width={48} height={48} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <Circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="#FFF"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * (healthScore?.score || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
              </BlurView>
            </View>
          </LinearGradient>
          
          {/* Slide-down Notifications Panel - Now anchored correctly */}
          {showNotifications && (
            <Animated.View 
              style={[
                styles.notificationsPanel,
                {
                  opacity: notifAnim,
                  transform: [{
                    translateY: notifAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }, {
                    scaleY: notifAnim
                  }]
                }
              ]}
            >
              <BlurView intensity={80} style={styles.notifBlur} tint={isDarkMode ? 'dark' : 'light'}>
                <Text style={styles.notifHeader}>RECENT NOTIFICATIONS</Text>
                {refillAlerts.length > 0 ? (
                  <View style={styles.notifList}>
                    {refillAlerts.map((a, i) => (
                      <View key={i} style={styles.notifItem}>
                        <View style={styles.notifIconBox}>
                          <Bell size={20} color={theme.danger} />
                        </View>
                        <View style={styles.notifContent}>
                          <Text style={styles.notifTitle}>Refill Required</Text>
                          <Text style={styles.notifSub}>{a.medicineName} is running low.</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyNotif}>
                    <Text style={styles.emptyNotifText}>All caught up! ✨</Text>
                  </View>
                )}
              </BlurView>
            </Animated.View>
          )}
        </View>

        <View style={styles.body}>
          {/* 2. TODAY'S SCHEDULE */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/meds')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.skeletonList}>
              {[1, 2].map(i => <View key={i} style={styles.skeletonCard} />)}
            </View>
          ) : (pills.filter(p => !p.taken && !p.skipped).length === 0 && appointments.length === 0) ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle size={28} color={theme.primary} />
              </View>
              <Text style={styles.emptyTitle}>You're all clear today</Text>
              <Text style={styles.emptySub}>No medical appointments or medications remaining for today.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {appointments.map((appt: any, i) => (
                <View key={`appt-${i}`} style={styles.card}>
                  <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EEF2FF' }]}>
                    <Calendar size={24} color={isDarkMode ? '#818CF8' : '#4F46E5'} strokeWidth={2.5} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{appt.reason || 'Medical Consultation'}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>{appt.hospitalId?.name}</Text>
                  </View>
                  <View style={styles.cardEnd}>
                    <Text style={[styles.cardTime, { color: isDarkMode ? '#818CF8' : '#4F46E5' }]}>{appt.timeSlot}</Text>
                    <Text style={styles.cardLabel}>ALERT</Text>
                  </View>
                </View>
              ))}

              {pills.filter(p => !p.taken && !p.skipped).map((pill, i) => (
                <View key={`pill-${i}`} style={styles.card}>
                  <TouchableOpacity 
                    onPress={() => handleToggleTaken(pill._id, { taken: true })}
                    style={[styles.cardIcon, { backgroundColor: isDarkMode ? '#78350F' : '#FFF7ED' }]}
                  >
                    <Pill size={24} color={isDarkMode ? '#FB923C' : '#EA580C'} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{pill.medicineName || pill.name}</Text>
                    <Text style={styles.cardSub}>{pill.dosage}</Text>
                  </View>
                  <View style={styles.cardEnd}>
                    <Text style={styles.cardTime}>{pill.scheduledTime}</Text>
                    <View style={styles.pillActions}>
                      <TouchableOpacity 
                        onPress={() => handleToggleTaken(pill._id, { taken: true })}
                        style={styles.actionBtnCheck}
                      >
                        <Check size={20} color={theme.accentForeground} strokeWidth={3} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleToggleTaken(pill._id, { skipped: true })}
                        style={styles.actionBtnX}
                      >
                        <X size={20} color={theme.danger} strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 2.5 DOCTOR'S NOTES & ADVICE */}
          {clinicalNotes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doctor's Advice</Text>
              <View style={styles.list}>
                {clinicalNotes.map((note, i) => (
                  <View key={`note-${i}`} style={styles.adviceCard}>
                    <View style={styles.adviceHeader}>
                      <View style={styles.adviceAvatarRow}>
                        <View style={styles.adviceAvatar}>
                          <User size={16} color={theme.primary} />
                        </View>
                        <View>
                          <Text style={styles.adviceName}>Dr. {note.doctorId?.name}</Text>
                          <Text style={styles.adviceSpec}>{note.doctorId?.specialty}</Text>
                        </View>
                      </View>
                      <Text style={styles.adviceDate}>{new Date(note.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.adviceText}>{note.content}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 3. QUICK ACCESS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.grid}>
              {[
                { label: "Meds", href: "/(tabs)/meds", icon: Pill, color: "#ECFDF5", iconColor: "#10B981" },
                { label: "Appointments", href: "/appointments", icon: Calendar, color: "#EFF6FF", iconColor: "#3B82F6" },
                { label: "Vault", href: "/(tabs)/vault", icon: FileText, color: "#F5F3FF", iconColor: "#8B5CF6" },
                { label: "Family", href: "/family", icon: Users, color: "#FFF7ED", iconColor: "#F97316" },
                { label: "Emergency", href: "/emergency", icon: QrCode, color: "#FEF2F2", iconColor: "#EF4444" },
                { label: "Profile", href: "/(tabs)/profile", icon: User, color: "#F8FAFC", iconColor: "#64748B" },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.gridItem}
                  onPress={() => router.push(item.href as any)}
                >
                  <View style={[styles.gridIcon, { backgroundColor: item.color }]}>
                    <item.icon size={24} color={item.iconColor} strokeWidth={2} />
                  </View>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
