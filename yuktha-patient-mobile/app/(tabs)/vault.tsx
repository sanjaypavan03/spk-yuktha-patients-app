import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator, 
    Dimensions,
    Platform,
    SafeAreaView
} from 'react-native';
import { 
    Lock, 
    Shield, 
    FileText, 
    Activity, 
    Brain, 
    HeartPulse, 
    Droplets, 
    TestTube2, 
    ShieldAlert, 
    ClipboardCheck, 
    Microscope, 
    Share2, 
    ArrowLeft, 
    ChevronRight, 
    Search,
    ShieldCheck,
    Sparkles,
    Plus
} from "lucide-react-native";
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { SecretVaultModal } from '../../src/components/SecretVaultModal';
import { getLocalReports } from '../../src/lib/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const categories = [
    { id: 'mri', label: 'MRI Scan', icon: Brain, bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE' },
    { id: 'ultrasound', label: 'Ultrasound', icon: HeartPulse, bg: '#FDF2F8', color: '#DB2777', border: '#FCE7F3' },
    { id: 'blood', label: 'Blood Test', icon: Droplets, bg: '#FFF7ED', color: '#EA580C', border: '#FFEDD5' },
    { id: 'urine', label: 'Urine Analysis', icon: TestTube2, bg: '#FEFCE8', color: '#CA8A04', border: '#FEF9C3' },
    { id: 'ecg', label: 'ECG', icon: Activity, bg: '#F5F3FF', color: '#7C3AED', border: '#EDE9FE' },
    { id: 'thyroid', label: 'Thyroid Test', icon: ShieldAlert, bg: '#ECFEFF', color: '#0891B2', border: '#CFFAFE' },
    { id: 'diabetes', label: 'Diabetes Test', icon: ClipboardCheck, bg: '#FFFAF0', color: '#F97316', border: '#FFF1E2' },
    { id: 'allergy', label: 'Allergy Test', icon: Microscope, bg: '#F0FDF4', color: '#059669', border: '#DCFCE7' },
    { id: 'others', label: 'Other Tests', icon: Share2, bg: '#F8FAFC', color: '#64748B', border: '#F1F5F9' },
];

export default function VaultScreen() {
    const { user, token, API_URL } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true); // Open modal initially if not verified
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCat, setSelectedCat] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isVerified) {
            fetchReports();
        }
    }, [isVerified]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            console.log('📂 Loading reports from LOCAL STORAGE...');
            const localData = await getLocalReports();
            setReports(localData || []);
        } catch (error) {
            console.error('Failed to load local reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesCat = selectedCat ? r.category?.toLowerCase() === selectedCat.id : true;
        const matchesSearch = searchQuery.trim() === '' || 
            (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r._id || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const styles = getStyles(theme);

    if (!isVerified) {
        return (
            <SafeAreaView style={[styles.lockContainer, { backgroundColor: isDarkMode ? '#020617' : '#0F172A' }]}>
                <SecretVaultModal 
                    isOpen={isModalOpen}
                    onClose={() => router.push('/dashboard')}
                    onSuccess={() => {
                        setIsVerified(true);
                        setIsModalOpen(false);
                    }}
                />
                <View style={styles.lockPlaceholder}>
                    <Lock size={48} color={theme.primary + '22'} />
                    <Text style={styles.lockText}>Security Verification Required</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[]} bounces={true}>
                {/* Header Area (1:1 with Screenshot) */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity 
                            style={styles.backBtn}
                            onPress={() => selectedCat ? setSelectedCat(null) : router.push('/dashboard')}
                        >
                            <ArrowLeft size={16} color="#94A3B8" />
                            <Text style={styles.backText}>{selectedCat ? 'Back to Categories' : 'Back to Dashboard'}</Text>
                        </TouchableOpacity>
                        <View style={styles.secureBadge}>
                            <ShieldCheck size={14} color="#10B981" />
                            <Text style={styles.secureBadgeText}>SECURE</Text>
                        </View>
                    </View>

                    {selectedCat ? (
                        <View style={styles.titleSection}>
                             <View style={styles.catHeaderContainer}>
                                <View style={[styles.catIconBox, { backgroundColor: selectedCat.bg, borderColor: selectedCat.border }]}>
                                    <selectedCat.icon size={24} color={selectedCat.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.titleSmall}>{selectedCat.label}</Text>
                                    <Text style={styles.subtitleSmall}>0 Reports archived</Text>
                                </View>
                                <TouchableOpacity style={styles.addReportBtn}>
                                    <Plus size={16} color="#FFFFFF" strokeWidth={3} />
                                    <Text style={styles.addReportText}>Add New Report</Text>
                                </TouchableOpacity>
                             </View>
                        </View>
                    ) : (
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Security Vault</Text>
                            <Text style={styles.subtitle}>Select a medical category to review your secured history.</Text>
                        </View>
                    )}

                    {!selectedCat && (
                        <View style={styles.searchWrapper}>
                            <Search size={18} color="#CBD5E1" style={styles.searchIcon} />
                            <TextInput 
                                style={styles.searchInput}
                                placeholder="Search by title or ID..."
                                placeholderTextColor="#CBD5E1"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.main}>
                    {selectedCat ? (
                        /* Filtered Report List */
                        <View style={styles.reportList}>
                            {filteredReports.length === 0 ? (
                                <View style={styles.emptyView}>
                                    <View style={styles.emptyIconCircle}>
                                        <selectedCat.icon size={32} color="#E2E8F0" />
                                    </View>
                                    <Text style={styles.emptyTitle}>Private Enclave</Text>
                                    <Text style={styles.emptySub}>
                                        No {selectedCat.label} records found. Secure your first document to see it here.
                                    </Text>
                                    <TouchableOpacity style={styles.uploadBtn}>
                                        <Text style={styles.uploadBtnText}>Upload {selectedCat.label}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                 filteredReports.map((report) => (
                                    <View key={report._id} style={styles.reportCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.cardIconBox, { backgroundColor: colorForId(report.category).bg }]}>
                                                {iconForId(report.category, 18)}
                                            </View>
                                            <View style={styles.cardHeaderMeta}>
                                                <View style={[
                                                    styles.sentimentBadge, 
                                                    { backgroundColor: report.analysis?.status === 'Abnormal' ? '#FEF2F2' : '#ECFDF5' }
                                                ]}>
                                                    <View style={[
                                                        styles.sentimentDot, 
                                                        { backgroundColor: report.analysis?.status === 'Abnormal' ? '#EF4444' : '#10B981' }
                                                    ]} />
                                                    <Text style={[
                                                        styles.sentimentText, 
                                                        { color: report.analysis?.status === 'Abnormal' ? '#B91C1C' : '#047857' }
                                                    ]}>
                                                        {report.analysis?.status || 'Normal'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        <View style={{ marginBottom: 12 }}>
                                            <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                                            <Text style={styles.reportClinic}>{report.clinic || 'Yuktha Diagnostics'}</Text>
                                        </View>

                                        <View style={styles.aiInsightBox}>
                                            <View style={styles.aiInsightHeader}>
                                                <Sparkles size={12} color="#10B981" />
                                                <Text style={styles.aiInsightLabel}>AI CLINICAL INSIGHTS</Text>
                                            </View>
                                            <Text style={styles.reportSummary} numberOfLines={3}>
                                                {report.analysis?.summary || report.summary || "Medical data analysis complete. No significant abnormalities detected in primary metrics."}
                                            </Text>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <View style={styles.reportDateContainer}>
                                                <Calendar size={12} color={theme.mutedForeground} />
                                                <Text style={styles.reportDate}>
                                                    {format(new Date(report.date || report.createdAt), 'MMM d, yyyy')}
                                                </Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={styles.readBtn}
                                                onPress={() => router.push({
                                                    pathname: '/(tabs)/vault', // This would ideally go to a details page
                                                    params: { reportId: report._id }
                                                })}
                                            >
                                                <Text style={styles.readBtnText}>View Details</Text>
                                                <ChevronRight size={14} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    ) : (
                        /* 3x3 Category Grid (Refined for 1:1 Parity) */
                        <View style={styles.grid}>
                            {categories.map((cat) => (
                                <TouchableOpacity 
                                    key={cat.id} 
                                    style={styles.gridItem}
                                    onPress={() => setSelectedCat(cat)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.gridIconCard, { backgroundColor: cat.bg }]}>
                                        <View style={styles.gridIconCircle}>
                                            <cat.icon size={22} color={cat.color} strokeWidth={1.5} />
                                        </View>
                                    </View>
                                    <Text style={styles.gridLabel}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Helper to find icon by category ID
const iconForId = (id: string, size: number) => {
    const cat = categories.find(c => c.id === id?.toLowerCase()) || categories[8];
    return <cat.icon size={size} color={cat.color} />;
};

const colorForId = (id: string) => {
    return categories.find(c => c.id === id?.toLowerCase()) || categories[8];
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    lockContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockPlaceholder: {
        alignItems: 'center',
        opacity: 0.5,
    },
    lockText: {
        marginTop: 20,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.3,
    },
    scrollContent: {
        paddingBottom: 110,
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: theme.border,
    },
    secureBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.primary,
        letterSpacing: 0.5,
    },
    titleSection: {
        marginBottom: 24,
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
        maxWidth: 280,
    },
    titleSmall: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    subtitleSmall: {
        fontSize: 11,
        color: theme.mutedForeground,
        fontWeight: '600',
    },
    addReportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.primary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 6,
    },
    addReportText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    catHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    catIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        position: 'relative',
        width: '100%',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: '50%',
        marginTop: -9,
        zIndex: 10,
    },
    searchInput: {
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 24,
        paddingVertical: 14,
        paddingLeft: 48,
        paddingRight: 20,
        fontSize: 15,
        color: theme.foreground,
        fontWeight: '500',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    main: {
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 24,
    },
    gridItem: {
        width: (SCREEN_WIDTH - 64) / 3, // 3 column layout for absolute parity
        alignItems: 'center',
    },
    gridIconCard: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gridLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.foreground,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    reportList: {
        gap: 16,
    },
    reportCard: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardHeaderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconBox: {
        padding: 8,
        borderRadius: 12,
    },
    reportDate: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    sentimentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    sentimentDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    sentimentText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    aiInsightBox: {
        backgroundColor: theme.isDarkMode ? 'rgba(16,185,129,0.05)' : '#F8FAFC',
        padding: 14,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(16,185,129,0.1)' : '#F1F5F9',
    },
    aiInsightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    aiInsightLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#10B981',
        letterSpacing: 1,
    },
    reportDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        marginBottom: 4,
    },
    reportClinic: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    reportSummary: {
        fontSize: 14,
        color: theme.mutedForeground,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    idBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: theme.muted,
        borderRadius: 4,
    },
    idText: {
        fontSize: 8,
        fontWeight: '900',
        color: theme.mutedForeground,
        letterSpacing: 1,
    },
    readBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.primary,
    },
    emptyView: {
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: theme.card,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 13,
        color: theme.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 32,
    },
    uploadBtn: {
        backgroundColor: theme.muted,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    uploadBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.foreground,
    }
});
