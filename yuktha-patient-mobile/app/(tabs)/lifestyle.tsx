import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { 
    Sparkles, 
    ArrowLeft, 
    Activity, 
    Flame, 
    Moon, 
    GlassWater, 
    ChevronRight,
    Trophy
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LifestyleScreen() {
    const router = useRouter();

    const insights = [
        { title: 'Sleep Hygiene', desc: 'Your average sleep was 7.2h last week. Try to keep it consistent.', icon: Moon, color: '#6366f1', bg: '#eef2ff' },
        { title: 'Hydration Goal', desc: 'You met 85% of your daily water intake goal. Keep it up!', icon: GlassWater, color: '#0ea5e9', bg: '#f0f9ff' },
        { title: 'Activity Level', desc: 'Active calories burned: 450 kcal today.', icon: Flame, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Lifestyle Insights</Text>
                    </View>
                    <View style={styles.heroCard}>
                        <Sparkles size={32} color="#059669" />
                        <Text style={styles.heroTitle}>AI Health Score</Text>
                        <Text style={styles.heroScore}>84/100</Text>
                        <Text style={styles.heroSub}>Your lifestyle habits are improving!</Text>
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    <Text style={styles.sectionTitle}>Daily Progress</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Activity size={24} color="#10b981" />
                            <Text style={styles.gridVal}>8,432</Text>
                            <Text style={styles.gridLabel}>Steps</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Trophy size={24} color="#f59e0b" />
                            <Text style={styles.gridVal}>Level 4</Text>
                            <Text style={styles.gridLabel}>Wellness</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 32 }]}>AI Personal Insights</Text>
                    <View style={styles.insightList}>
                        {insights.map((item, idx) => (
                            <TouchableOpacity key={idx} style={styles.insightCard}>
                                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <View style={styles.insightInfo}>
                                    <Text style={styles.insightTitle}>{item.title}</Text>
                                    <Text style={styles.insightDesc}>{item.desc}</Text>
                                </View>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { paddingBottom: 50 },
    header: { padding: 24, paddingTop: 60, paddingBottom: 100, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 40 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    heroCard: { backgroundColor: 'white', padding: 32, borderRadius: 32, alignItems: 'center', position: 'absolute', top: 130, left: 24, right: 24, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    heroTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12 },
    heroScore: { fontSize: 48, fontWeight: '900', color: '#0f172a', marginVertical: 8 },
    heroSub: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    body: { paddingTop: 180, paddingHorizontal: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    grid: { flexDirection: 'row', gap: 16 },
    gridItem: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    gridVal: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 8 },
    gridLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
    insightList: { gap: 12 },
    insightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    insightInfo: { flex: 1, marginLeft: 16 },
    insightTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    insightDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
