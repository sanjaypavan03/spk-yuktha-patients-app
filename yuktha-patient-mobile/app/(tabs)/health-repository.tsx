import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { 
  Search, 
  ChevronLeft, 
  Activity, 
  Droplets, 
  Scan, 
  FlaskConical, 
  Beaker, 
  ClipboardList, 
  FileText, 
  ChevronRight 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const reportCategories = [
  { name: "MRI Scan", icon: Activity, bg: "#EFF6FF", iconBg: "#DBEAFE", color: "#2563EB" },
  { name: "Blood Test", icon: Droplets, bg: "#FDF2F8", iconBg: "#FCE7F3", color: "#EF4444" },
  { name: "X-Ray", icon: Scan, bg: "#F0FDF4", iconBg: "#DCFCE7", color: "#16A34A" },
  { name: "Urine Analysis", icon: FlaskConical, bg: "#FEFCE8", iconBg: "#FEF9C3", color: "#CA8A04" },
  { name: "Lab Analysis", icon: Beaker, bg: "#FEFCE8", iconBg: "#FEF9C3", color: "#EA580C" },
  { name: "Other", icon: ClipboardList, bg: "#EFF6FF", iconBg: "#DBEAFE", color: "#3B82F6" },
];

export default function HealthRepositoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header (1:1 with Web) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Health Repository</Text>
          <Text style={styles.subtitle}>Access all your diagnostic reports and laboratory tests.</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Your Reports Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Reports</Text>
        </View>

        {/* 3. Search Bar (1:1 with Web Input) */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search for test or report..." 
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* 4. Tests & Diagnostics Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.gridTitle}>Tests & Diagnostics</Text>
          <View style={styles.grid}>
            {reportCategories.map((cat, index) => (
              <TouchableOpacity key={index} style={[styles.card, { backgroundColor: cat.bg }]}>
                <View style={styles.iconCircle}>
                  <cat.icon size={32} color={cat.color} />
                </View>
                <Text style={styles.cardName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Health Report AI Analysis CTA (1:1 with Web Card) */}
        <TouchableOpacity 
          style={styles.ctaCard}
          onPress={() => router.push('/(tabs)/reports')}
        >
          <View style={styles.ctaRow}>
            <View style={styles.ctaIconBox}>
              <FileText size={24} color="#10B981" />
            </View>
            <View style={styles.ctaInfo}>
              <Text style={styles.ctaTitle}>Health Report AI Analysis</Text>
              <Text style={styles.ctaSub}>Upload a report for a detailed breakdown and history tracking.</Text>
            </View>
          </View>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>New Analysis</Text>
            <ChevronRight size={14} color="#059669" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionHeader: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  gridSection: {
    marginBottom: 32,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: (SCREEN_WIDTH - 56) / 2,
    height: 180,
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    gap: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  ctaSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  ctaBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  }
});
