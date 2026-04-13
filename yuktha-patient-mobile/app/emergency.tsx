import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert, Phone, AlertCircle, Droplets, ShieldCheck, ChevronDown, Eye } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Dark blue-black for high contrast
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  qrContainer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 20,
  },
  pulseContainer: {
    padding: 12,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.2)', // Green pulse matching theme
  },
  statusText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructions: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  revealBox: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  revealBtnText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emergencyBtn: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emergencyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default function EmergencyQRScreen() {
  const { user, token, API_URL } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [medicalInfo, setMedicalInfo] = useState<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the QR border
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (token) {
        fetchMedicalInfo();
    }
  }, [token]);

  const fetchMedicalInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medical-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMedicalInfo(data.data);
      }
    } catch (error) {
      console.error('Fetch medical info error:', error);
    }
  };

  const styles = getStyles(theme);

  // Fallback QR content if URL is missing
  const qrValue = user?.qrPublicUrl || `https://yuktha.health/emergency/${user?.id || 'missing'}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <ArrowLeft size={18} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EMERGENCY VAULT</Text>
        <ShieldCheck size={20} color="#10B981" />
      </View>

      <View style={styles.content}>
        <Text style={styles.statusText}>Emergency Identity</Text>
        <Text style={styles.instructions}>Provide this code to responders. It contains life-saving info and alerts your family when scanned.</Text>

        <Animated.View style={[styles.pulseContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={220}
              color="#020617"
              backgroundColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        {!isRevealed ? (
            <View style={styles.revealBox}>
                <TouchableOpacity 
                    style={styles.revealBtn} 
                    onPress={() => setIsRevealed(true)}
                    activeOpacity={0.7}
                >
                    <Eye size={16} color="#10B981" />
                    <Text style={styles.revealBtnText}>TAP TO REVEAL DETAILS</Text>
                    <ChevronDown size={16} color="#10B981" />
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Droplets size={12} color="#EF4444" />
                    <Text style={styles.infoLabel}>Blood Group</Text>
                </View>
                <Text style={styles.infoValue}>{medicalInfo?.bloodGroup || 'Not Set'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertCircle size={12} color="#F59E0B" />
                    <Text style={styles.infoLabel}>Allergies</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {medicalInfo?.knownAllergies ? 'YES (SEE SCAN)' : 'NONE'}
                </Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Phone size={12} color="#10B981" />
                    <Text style={styles.infoLabel}>Emergency Contact</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {medicalInfo?.emergencyContact1Name || 'NOT SET'}
                </Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <ShieldAlert size={12} color="#3B82F6" />
                    <Text style={styles.infoLabel}>Conditions</Text>
                </View>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {medicalInfo?.chronicConditions?.length > 0 ? 'RECORDED' : 'NONE'}
                </Text>
                </View>
            </View>
        )}

        <TouchableOpacity 
          style={styles.emergencyBtn} 
          activeOpacity={0.8}
          onPress={() => {
            // Intent for emergency services could be added here
          }}
        >
          <Phone size={20} color="#FFF" fill="#FFF" />
          <Text style={styles.emergencyBtnText}>Call Emergency Services</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
