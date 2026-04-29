import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Clock, ChevronRight, Plus, User } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.mutedForeground,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginTop: 8,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.mutedForeground,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    marginLeft: 4,
  },
  appointmentCard: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.foreground,
  },
  drSpec: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
  },
  cardDetails: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  detailHighlight: {
    color: theme.foreground,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  }
});

export default function AppointmentsScreen() {
  const { user, token, API_URL } = useAuth();
  const { isDarkMode, theme } = useTheme();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
        fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color="#94A3B8" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medical Consults</Text>
        <Text style={styles.subtitle}>Keep track of your upcoming hospital visits.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : appointments.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>UPCOMING VISITS</Text>
            {appointments.map((appt, i) => (
              <View key={i} style={styles.appointmentCard}>
                <View style={styles.cardTop}>
                  <View style={styles.doctorInfo}>
                    <View style={styles.avatarBox}>
                      <User size={20} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={styles.drName}>{appt.doctorName || `Dr. ${appt.doctorId?.name || 'Assigned Specialist'}`}</Text>
                      <Text style={styles.drSpec}>{appt.doctorId?.specialty || appt.department || 'Consultant'}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>CONFIRMED</Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={14} color={theme.mutedForeground} />
                    <Text style={styles.detailText}>
                      Date: <Text style={styles.detailHighlight}>{format(new Date(appt.date), 'EEEE, MMMM do')}</Text>
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={14} color={theme.mutedForeground} />
                    <Text style={styles.detailText}>
                      Slot: <Text style={styles.detailHighlight}>{appt.timeSlot}</Text>
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={theme.mutedForeground} />
                    <Text style={styles.detailText}>
                      Place: <Text style={styles.detailHighlight}>{appt.hospitalId?.name || 'Main Hospital Wing'}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Calendar size={32} color={theme.mutedForeground} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No Consultations</Text>
            <Text style={styles.emptyText}>You don't have any upcoming appointments scheduled currently.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.floatingBtn} activeOpacity={0.8}>
        <Plus size={20} color="#FFFFFF" strokeWidth={3} />
        <Text style={styles.floatingBtnText}>Book Appointment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
