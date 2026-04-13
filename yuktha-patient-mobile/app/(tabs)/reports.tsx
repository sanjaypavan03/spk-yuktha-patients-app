import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator, 
    Platform,
    Dimensions,
    Alert,
    SafeAreaView,
    Modal,
    Animated,
    Easing
} from 'react-native';
import { 
    FileText, 
    Sparkles, 
    ArrowRight, 
    ShieldCheck, 
    CheckCircle2, 
    Lock, 
    Activity, 
    Upload, 
    Calendar, 
    Building2, 
    User as UserIcon,
    ChevronDown,
    ChevronRight,
    FileUp,
    X,
    Search,
    Shield
} from "lucide-react-native";
import { SecretVaultModal } from '../../src/components/SecretVaultModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { analyzeMedicalReportLocally } from '../../src/lib/gemini';
import { saveLocalReport } from '../../src/lib/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const reportTypes = [
    { id: 'blood', label: 'Blood Test' },
    { id: 'mri', label: 'MRI Scan' },
    { id: 'ultrasound', label: 'Ultrasound' },
    { id: 'ecg', label: 'ECG' },
    { id: 'urine', label: 'Urine Analysis' },
    { id: 'thyroid', label: 'Thyroid Test' },
    { id: 'diabetes', label: 'Diabetes Test' },
    { id: 'allergy', label: 'Allergy Test' },
    { id: 'others', label: 'Other Tests' },
];

const languages = [
    "English", "Assamese", "Bengali", "Bodo", "Dogri", "Gujarati", "Hindi", 
    "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri (Meitei)", 
    "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi", 
    "Tamil", "Telugu", "Urdu"
];

const profiles = ["Myself", "Family Member", "Patient 02", "Patient 03"];

const getStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingBottom: 110 },
    header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', position: 'relative' },
    headerContent: { zIndex: 10 },
    aiTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, opacity: 0.8 },
    aiTagText: { color: '#A5B4FC', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginLeft: 8 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', fontFamily: 'PlayfairDisplay_900Black_Italic', letterSpacing: -0.5 },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 10, lineHeight: 22, fontWeight: '500', fontFamily: 'Poppins_400Regular' },
    headerBadgeRow: { flexDirection: 'row', marginTop: 24 },
    headerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    headerBadgeLabel: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', marginLeft: 8 },

    main: { paddingHorizontal: 16 },
    tabsWrapper: { marginTop: -30, backgroundColor: theme.card, borderRadius: 40, borderWidth: 1, borderColor: theme.border, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.06, shadowRadius: 25, elevation: 8, overflow: 'hidden' },
    tabsContainer: { flexDirection: 'row', padding: 6, backgroundColor: theme.muted, borderBottomWidth: 1, borderBottomColor: theme.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 30 },
    tabActive: { backgroundColor: theme.card, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    tabText: { fontSize: 13, fontWeight: 'bold', color: theme.mutedForeground, marginLeft: 8, fontFamily: 'Poppins_600SemiBold' },
    tabTextActive: { color: theme.primary },
    formBody: { padding: 24 },
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    gridCol: { flex: 1 },
    fieldLabel: { fontSize: 10, fontWeight: '900', color: theme.mutedForeground, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, marginLeft: 4, fontFamily: 'Poppins_700Bold' },
    inputWrapper: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 16, top: '50%', marginTop: -8, zIndex: 10 },
    input: { backgroundColor: theme.muted, borderRadius: 16, paddingVertical: 14, paddingLeft: 44, paddingRight: 16, borderWidth: 1, borderColor: theme.border, fontSize: 15, fontWeight: '600', color: theme.foreground, height: 52 },
    dropdown: { backgroundColor: theme.muted, borderRadius: 16, paddingVertical: 14, paddingLeft: 44, paddingRight: 16, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52 },
    dropdownText: { fontSize: 15, fontWeight: '700', color: theme.foreground, maxWidth: '80%' },
    uploadArea: { marginTop: 20, marginBottom: 24 },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: theme.border, borderRadius: 32, padding: 40, alignItems: 'center', backgroundColor: theme.muted },
    uploadBoxActive: { borderColor: theme.primary, backgroundColor: theme.accent },
    uploadIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.border },
    uploadIconBoxActive: { backgroundColor: theme.accent, borderColor: theme.primary },
    uploadMainText: { fontSize: 13, fontWeight: 'bold', color: theme.foreground, letterSpacing: 0.5 },
    uploadSubText: { fontSize: 11, color: theme.mutedForeground, fontWeight: '500', marginTop: 6 },
    pasteArea: { marginTop: 20, marginBottom: 24 },
    textArea: { backgroundColor: theme.muted, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.border, fontSize: 15, fontWeight: '500', color: theme.foreground, height: 300 },
    analyzeBtn: { backgroundColor: '#0F172A', borderRadius: 24, height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    analyzeBtnDisabled: { backgroundColor: '#0F172A', opacity: 0.35, borderRadius: 24, height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    analyzeBtnText: { color: 'white', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.2 },
    analyzeBtnTextDisabled: { color: 'rgba(255,255,255,0.6)', fontSize: 17, fontWeight: 'bold' },
    recentSection: { marginTop: 40, paddingHorizontal: 4 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    recentTitle: { fontSize: 20, fontWeight: 'bold', color: theme.foreground, fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif' },
    unlockBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
    unlockText: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5', marginRight: 4 },
    vaultHiddenCard: { backgroundColor: theme.card, borderRadius: 28, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: theme.border, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
    vaultHiddenTitle: { fontSize: 18, fontWeight: 'bold', color: theme.foreground, marginTop: 16, fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif' },
    vaultHiddenSub: { fontSize: 14, color: theme.mutedForeground, textAlign: 'center', marginTop: 6, fontWeight: '500', lineHeight: 20 },
    recentList: { gap: 12 },
    recentCard: { backgroundColor: theme.card, borderRadius: 28, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    recentIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.muted, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    recentInfo: { flex: 1 },
    recentDocTitle: { fontSize: 15, fontWeight: 'bold', color: theme.foreground },
    recentDocMeta: { fontSize: 10, color: theme.mutedForeground, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
    successContainer: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 20 },
    successCard: { backgroundColor: theme.card, borderRadius: 40, padding: 32, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 40, elevation: 10 },
    successIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: theme.border },
    successTitle: { fontSize: 26, fontWeight: 'bold', color: theme.foreground, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif' },
    successSub: { fontSize: 15, color: theme.mutedForeground, textAlign: 'center', marginTop: 10, lineHeight: 22, fontWeight: '500' },
    successCategoryLabel: { color: theme.primary, fontWeight: 'bold' },
    extractedInfoBox: { width: '100%', backgroundColor: theme.muted, borderRadius: 24, padding: 20, marginTop: 24, borderWidth: 1, borderColor: theme.border },
    successTinyLabel: { fontSize: 9, fontWeight: '900', color: theme.mutedForeground, letterSpacing: 1.5, marginBottom: 6 },
    extractedTitle: { fontSize: 17, fontWeight: 'bold', color: theme.foreground },
    successParamList: { marginTop: 8 },
    successParamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    successParamName: { fontSize: 14, fontWeight: 'bold', color: theme.mutedForeground },
    successParamBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    successParamValue: { fontSize: 12, fontWeight: '900' },
    openingVaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    openingVaultText: { fontSize: 14, fontWeight: 'bold', color: theme.primary, marginHorizontal: 10 },
    selectorBackdrop: { flex: 1, backgroundColor: 'transparent' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    floatingMenu: { position: 'absolute', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15, borderWidth: 1, zIndex: 1000 },
    datePickerModalView: { backgroundColor: theme.card, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
    menuSearchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, marginBottom: 8, height: 40 },
    menuSearchIcon: { marginRight: 8 },
    menuSearchInput: { 
        flex: 1, 
        fontSize: 14, 
        fontWeight: '500',
        paddingVertical: 0,
        ...Platform.select({
            web: { outlineStyle: 'none' }
        } as any)
    },
    menuScroll: { maxHeight: 250 },
    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 2 },
    menuItemText: { fontSize: 14, fontWeight: '500' },
    noResults: { padding: 20, alignItems: 'center' },
    noResultsText: { fontSize: 13, fontWeight: '500' },
    datePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    datePickerHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: theme.foreground, fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif' },
    datePickerDoneBtn: { fontSize: 16, fontWeight: 'bold', color: theme.primary }
});

function SelectorModal({ visible, onClose, title, options, onSelect, pos, currentVal, searchable, theme, isDarkMode }: any) {
    const [search, setSearch] = useState('');
    const filtered = options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase()));
    
    const styles = getStyles(theme);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.selectorBackdrop} onPress={onClose} activeOpacity={1}>
                <View style={[styles.floatingMenu, { top: pos.y, left: pos.x, width: pos.width, backgroundColor: theme.card, borderColor: theme.border }]}>
                    {searchable && (
                        <View style={[styles.menuSearchWrapper, { backgroundColor: theme.muted }]}>
                            <Search size={14} color={theme.mutedForeground} style={styles.menuSearchIcon} />
                            <TextInput 
                                style={[styles.menuSearchInput, { color: theme.foreground }]} 
                                placeholder="Search..." 
                                placeholderTextColor={theme.mutedForeground}
                                value={search}
                                onChangeText={setSearch}
                                autoFocus
                            />
                        </View>
                    )}
                    <ScrollView style={styles.menuScroll} bounces={false} showsVerticalScrollIndicator={false}>
                        {filtered.map((item: string) => (
                            <TouchableOpacity 
                                key={item} 
                                style={[styles.menuItem, currentVal === item && { backgroundColor: theme.accent }]}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={[styles.menuItemText, { color: theme.foreground }, currentVal === item && { color: theme.accentForeground, fontWeight: '700' }]}>{item}</Text>
                                {currentVal === item && <CheckCircle2 size={14} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                        {filtered.length === 0 && (
                            <View style={styles.noResults}>
                                <Text style={[styles.noResultsText, { color: theme.mutedForeground }]}>No results found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function ReportsScreen() {
    const { user, token, API_URL } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const router = useRouter();

    // UI States
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [loading, setLoading] = useState(false);
    const [successState, setSuccessState] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    
    // Form States
    const [reportTitle, setReportTitle] = useState('');
    const [reportType, setReportType] = useState('');
    const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [hospitalName, setHospitalName] = useState('');
    const [profileLink, setProfileLink] = useState('Myself');
    const [rawText, setRawText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [fileSelected, setFileSelected] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [reviewing, setReviewing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (selectedDate) {
                setReportDate(format(selectedDate, 'yyyy-MM-dd'));
            }
        } else if (Platform.OS === 'ios') {
            if (selectedDate) {
                setReportDate(format(selectedDate, 'yyyy-MM-dd'));
            }
        }
    };

    // Refs for Positioning
    const langRef = React.useRef<View>(null);
    const typeRef = React.useRef<View>(null);
    const profileRef = React.useRef<View>(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0, width: 0 });

    // Animated Values for Chevrons
    const langAnim = React.useRef(new Animated.Value(0)).current;
    const typeAnim = React.useRef(new Animated.Value(0)).current;
    const profileAnim = React.useRef(new Animated.Value(0)).current;

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectorConfig, setSelectorConfig] = useState<any>({ title: '', options: [], onSelect: () => {}, anim: null, currentVal: '' });

    const openMenu = (ref: React.RefObject<View>, title: string, options: string[], onSelect: (val: string) => void, anim: Animated.Value, currentVal: string) => {
        ref.current?.measure((x, y, width, height, pageX, pageY) => {
            setMenuPos({ x: pageX, y: pageY + height, width });
            setSelectorConfig({ title, options, onSelect, anim, currentVal });
            setSelectorOpen(true);
            Animated.timing(anim, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        });
    };

    const closeSelector = () => {
        if (selectorConfig.anim) {
            Animated.timing(selectorConfig.anim, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
        setSelectorOpen(false);
    };

    const [vaultReports, setVaultReports] = useState<any[]>([]);
    const [isVaultVerified, setIsVaultVerified] = useState(false);
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

    useEffect(() => {
        if (isVaultVerified) fetchRecentVault();
    }, [isVaultVerified]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
            setFileSelected(true);
        }
    };

    const fetchRecentVault = async () => {
        try {
            console.log('📂 Fetching recent local reports...');
            const localData = await getLocalReports();
            // Take the 3 most recent
            setVaultReports(localData.slice(0, 3));
        } catch (error) { 
            console.error('Failed to fetch recent local vault:', error); 
        }
    };

    const handleAnalyze = async (mode: 'upload' | 'paste') => {
        const textToAnalyze = mode === 'paste' ? rawText : `File Upload: ${reportTitle} at ${hospitalName}. ${reportType} report.`;
        if (mode === 'paste' && !rawText.trim()) { Alert.alert("Error", "Please paste report text to analyze."); return; }
        if (mode === 'upload' && !fileSelected) { Alert.alert("Error", "Please select a report file to upload."); return; }

        setLoading(true);
        try {
            console.log('🧪 Starting STANDALONE AI Analysis...');
            const input = mode === 'upload' ? { imageDataUri: selectedImage! } : textToAnalyze;
            
            const analysis = await analyzeMedicalReportLocally(input, { 
                language: selectedLanguage,
                reportType: reportType
            });

            if (!analysis) { 
                Alert.alert("Analysis Failed", 'AI was unable to extract data from this report.'); 
                setLoading(false); 
                return; 
            }

            // Enrich with UI form data
            const extracted = {
                ...analysis,
                reportTitle: reportTitle || analysis.reportTitle || `Medical Report - ${format(new Date(), 'MMM d')}`,
                category: reportType?.toLowerCase() || analysis.category || 'other',
                clinic: hospitalName || analysis.clinic || 'Yuktha Health',
                date: reportDate,
                fileDataUri: mode === 'upload' ? selectedImage : null
            };

            setExtractedData(extracted);
            setReviewing(true);
            
        } catch (error) { 
            console.error('Local Analysis Error:', error);
            Alert.alert("Error", "Local AI analysis failed. Please check your internet connection for Gemini."); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleSave = async () => {
        if (!extractedData) return;
        setLoading(true);

        try {
            console.log('💾 Saving to LOCAL STORAGE...');
            await saveLocalReport(extractedData);
            
            setSuccessState(true);
            // In standalone mode, we consider the "vault" verified if they can save
            setIsVaultVerified(true);
            setTimeout(() => { router.push('/vault'); }, 4000);
        } catch (error) { 
            console.error('Local Save Error:', error);
            Alert.alert("Error", "Failed to save report to local storage."); 
        } finally { 
            setLoading(false); 
        }
    };

    const styles = getStyles(theme);

    if (successState && extractedData) {
        return (
            <SafeAreaView style={styles.successContainer}>
                <View style={styles.successCard}>
                    <View style={styles.successIconBox}><CheckCircle2 size={48} color={theme.primary} /></View>
                    <Text style={styles.successTitle}>Saved to Secure Vault 🔒</Text>
                    <Text style={styles.successSub}>Your report was encrypted and auto-categorized under <Text style={styles.successCategoryLabel}> {extractedData.category?.toUpperCase()}</Text>.</Text>
                    <View style={styles.extractedInfoBox}>
                         <Text style={styles.successTinyLabel}>REPORT IDENTITY</Text>
                         <Text style={styles.extractedTitle} numberOfLines={1}>{extractedData.reportTitle}</Text>
                         {extractedData.parameters?.length > 0 && (
                             <View style={{ marginTop: 16 }}>
                                 <Text style={styles.successTinyLabel}>KEY PARAMETERS</Text>
                                 <View style={styles.successParamList}>
                                     {extractedData.parameters.slice(0, 3).map((p: any, i: number) => (
                                         <View key={i} style={styles.successParamRow}>
                                             <Text style={styles.successParamName}>{p.test}</Text>
                                             <View style={[styles.successParamBadge, { backgroundColor: p.status === 'High' || p.status === 'Low' ? (isDarkMode ? '#450a0a' : '#FEF2F2') : (isDarkMode ? '#064E3B' : '#ECFDF5') }]}>
                                                 <Text style={[styles.successParamValue, { color: p.status === 'High' || p.status === 'Low' ? theme.danger : theme.primary }]}>{p.value} {p.unit}</Text>
                                             </View>
                                         </View>
                                     ))}
                                 </View>
                             </View>
                         )}
                    </View>
                    <View style={styles.openingVaultRow}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <Text style={styles.openingVaultText}>Opening Secure Vault...</Text>
                        <ArrowRight size={14} color={theme.primary} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={true}>
                <LinearGradient colors={isDarkMode ? ['#020617', '#1e1b4b'] : ['#0F172A', '#312E81']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.headerContent}>
                        <View style={styles.aiTag}><Sparkles size={14} color="#A5B4FC" /><Text style={styles.aiTagText}>YUKTHA AI HEALTH INTELLIGENCE</Text></View>
                        <Text style={styles.headerTitle}>Analyze Lab Report</Text>
                        <Text style={styles.headerSub}>Upload your medical reports or paste raw results. Our advanced AI analyzes and extracts parameters in 23 languages, securing them in your vault.</Text>
                        <View style={styles.headerBadgeRow}>
                            <View style={styles.headerBadge}><ShieldCheck size={14} color={theme.primary} /><Text style={styles.headerBadgeLabel}>HIPAA Compliant</Text></View>
                            <View style={styles.headerBadge}><Lock size={14} color="#818CF8" /><Text style={styles.headerBadgeLabel}>E2EE Secured</Text></View>
                        </View>
                    </View>

                </LinearGradient>

                <View style={styles.main}>
                    {reviewing && extractedData ? (
                        /* REVIEW STAGE UI (MOBILE) */
                        <View style={[styles.tabsWrapper, { marginTop: -20, padding: 20 }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.recentTitle, { fontSize: 22 }]}>Review AI Analysis</Text>
                                <TouchableOpacity onPress={() => setReviewing(false)}>
                                    <X size={24} color={theme.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <View style={{ backgroundColor: theme.primary, padding: 8, borderRadius: 10, marginRight: 12 }}>
                                        <Sparkles size={18} color="white" />
                                    </View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.foreground }}>Clinical Insight</Text>
                                </View>
                                <Text style={{ fontSize: 14, color: theme.foreground, lineHeight: 22 }}>{extractedData.summary}</Text>
                            </View>

                            <View style={{ gap: 12, marginBottom: 24 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                    <Text style={styles.fieldLabel}>Status</Text>
                                    <View style={{ backgroundColor: extractedData.status === 'Abnormal' ? '#FEF2F2' : '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: extractedData.status === 'Abnormal' ? '#EF4444' : '#10B981' }}>{extractedData.status?.toUpperCase() || 'NORMAL'}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                                    <Text style={styles.fieldLabel}>Category</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.foreground, textTransform: 'capitalize' }}>{extractedData.category}</Text>
                                </View>
                            </View>

                            {extractedData.parameters?.length > 0 && (
                                <View style={{ backgroundColor: theme.card, borderRadius: 24, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 24 }}>
                                    <View style={{ backgroundColor: theme.muted, padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center' }}>
                                        <Activity size={14} color={theme.primary} style={{ marginRight: 8 }} />
                                        <Text style={[styles.fieldLabel, { marginBottom: 0 }]}>DETECTED PARAMETERS</Text>
                                    </View>
                                    <View style={{ padding: 16, gap: 12 }}>
                                        {extractedData.parameters.map((p: any, i: number) => (
                                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.foreground }}>{p.test}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: p.status === 'High' || p.status === 'Low' ? '#EF4444' : '#10B981' }}>{p.value} {p.unit}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity 
                                    style={[styles.tab, { backgroundColor: theme.muted, height: 60 }]} 
                                    onPress={() => setReviewing(false)}
                                >
                                    <Text style={{ color: theme.mutedForeground, fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.analyzeBtn, { flex: 2, height: 60 }]} 
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    <Text style={styles.analyzeBtnText}>{loading ? 'Saving...' : 'Confirm & Save 🔒'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.tabsWrapper}>
                            <View style={styles.tabsContainer}>
                            <TouchableOpacity style={[styles.tab, activeTab === 'upload' && styles.tabActive]} onPress={() => setActiveTab('upload')} activeOpacity={0.8}>
                                <Upload size={18} color={activeTab === 'upload' ? theme.primary : theme.mutedForeground} />
                                <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>Upload Report</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, activeTab === 'paste' && styles.tabActive]} onPress={() => setActiveTab('paste')} activeOpacity={0.8}>
                                <FileText size={18} color={activeTab === 'paste' ? theme.primary : theme.mutedForeground} />
                                <Text style={[styles.tabText, activeTab === 'paste' && styles.tabTextActive]}>Paste Raw Text</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formBody}>
                            <View style={styles.gridRow}>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Report Title</Text>
                                    <View style={styles.inputWrapper}>
                                        <FileText size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <TextInput style={styles.input} placeholder="Lab Checkup" placeholderTextColor={theme.mutedForeground} value={reportTitle} onChangeText={setReportTitle} />
                                    </View>
                                </View>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Language</Text>
                                    <TouchableOpacity ref={langRef} style={styles.inputWrapper} onPress={() => openMenu(langRef, 'Analysis Language', languages, setSelectedLanguage, langAnim, selectedLanguage)}>
                                        <Sparkles size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <View style={styles.dropdown}>
                                            <Text style={styles.dropdownText} numberOfLines={1}>{selectedLanguage}</Text>
                                            <Animated.View style={{ transform: [{ rotate: langAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><ChevronDown size={14} color={theme.mutedForeground} /></Animated.View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.gridRow, { marginTop: 16 }]}>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Report Type</Text>
                                    <TouchableOpacity ref={typeRef} style={styles.inputWrapper} onPress={() => openMenu(typeRef, 'Report Type', reportTypes.map(t => t.label), setReportType, typeAnim, reportType || 'Auto (AI)')}>
                                        <Activity size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <View style={styles.dropdown}>
                                            <Text style={styles.dropdownText} numberOfLines={1}>{reportType || 'Auto (AI)'}</Text>
                                            <Animated.View style={{ transform: [{ rotate: typeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><ChevronDown size={14} color={theme.mutedForeground} /></Animated.View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Date</Text>
                                    <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.7} onPress={() => setShowDatePicker(true)}>
                                        <Calendar size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <View style={styles.dropdown}>
                                            <Text style={styles.dropdownText}>{reportDate}</Text>
                                            <ChevronDown size={14} color={theme.mutedForeground} />
                                        </View>
                                    </TouchableOpacity>
                                    {showDatePicker && Platform.OS === 'android' && (
                                        <DateTimePicker value={new Date(reportDate)} mode="date" display="default" onChange={onDateChange} />
                                    )}
                                    {showDatePicker && Platform.OS === 'ios' && (
                                        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
                                            <View style={styles.modalOverlay}>
                                                <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)} activeOpacity={1} />
                                                <View style={styles.datePickerModalView}>
                                                    <View style={styles.datePickerHeader}>
                                                        <Text style={styles.datePickerHeaderTitle}>Select Date</Text>
                                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.datePickerDoneBtn}>Done</Text></TouchableOpacity>
                                                    </View>
                                                    <DateTimePicker 
                                                        value={new Date(reportDate)} 
                                                        mode="date" 
                                                        display="inline" 
                                                        onChange={onDateChange} 
                                                        accentColor={theme.primary}
                                                        themeVariant={isDarkMode ? 'dark' : 'light'}
                                                    />
                                                </View>
                                            </View>
                                        </Modal>
                                    )}
                                </View>
                            </View>

                            <View style={[styles.gridRow, { marginTop: 16 }]}>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Hospital / Clinic</Text>
                                    <View style={styles.inputWrapper}>
                                        <Building2 size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <TextInput style={styles.input} placeholder="City Medical" placeholderTextColor={theme.mutedForeground} value={hospitalName} onChangeText={setHospitalName} />
                                    </View>
                                </View>
                                <View style={styles.gridCol}>
                                    <Text style={styles.fieldLabel}>Profile Link</Text>
                                    <TouchableOpacity ref={profileRef} style={styles.inputWrapper} onPress={() => openMenu(profileRef, 'Link to Profile', profiles, setProfileLink, profileAnim, profileLink)}>
                                        <UserIcon size={16} color={theme.mutedForeground} style={styles.inputIcon} />
                                        <View style={styles.dropdown}>
                                            <Text style={styles.dropdownText}>{profileLink}</Text>
                                            <Animated.View style={{ transform: [{ rotate: profileAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><ChevronDown size={14} color={theme.mutedForeground} /></Animated.View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {activeTab === 'upload' ? (
                                <View style={styles.uploadArea}>
                                    <Text style={styles.fieldLabel}>Select Report File (PDF/Image)</Text>
                                    <TouchableOpacity 
                                        style={[styles.uploadBox, fileSelected && styles.uploadBoxActive]} 
                                        activeOpacity={0.7}
                                        onPress={pickImage}
                                    >
                                        <View style={[styles.uploadIconBox, fileSelected && styles.uploadIconBoxActive]}>
                                            {fileSelected ? <CheckCircle2 size={30} color={theme.primary} /> : <FileUp size={30} color={theme.mutedForeground} />}
                                        </View>
                                        <Text style={styles.uploadMainText}>{fileSelected ? 'IMAGE SELECTED ✅' : 'CLICK TO BROWSE GALLERY'}</Text>
                                        <Text style={styles.uploadSubText}>{fileSelected ? 'Selected for encryption' : 'Supports medical report images'}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.pasteArea}>
                                    <Text style={styles.fieldLabel}>Paste Raw Report Text</Text>
                                    <TextInput 
                                        style={styles.textArea}
                                        placeholder="Paste the text from your report here..."
                                        placeholderTextColor={theme.mutedForeground}
                                        multiline
                                        numberOfLines={10}
                                        value={rawText}
                                        onChangeText={setRawText}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}

                            <TouchableOpacity 
                                style={[styles.analyzeBtn, (!fileSelected && activeTab === 'upload') && styles.analyzeBtnDisabled]} 
                                onPress={() => handleAnalyze(activeTab)}
                                disabled={loading || (!fileSelected && activeTab === 'upload')}
                                activeOpacity={0.9}
                            >
                                {loading ? (
                                    <>
                                        <Sparkles size={20} color="#818CF8" style={{ marginRight: 10, opacity: 0.8 }} />
                                        <Text style={styles.analyzeBtnText}>Analyzing Health Data...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} color={(!fileSelected && activeTab === 'upload') ? "rgba(255,255,255,0.4)" : "#818CF8"} style={{ marginRight: 10 }} />
                                        <Text style={(!fileSelected && activeTab === 'upload') ? styles.analyzeBtnTextDisabled : styles.analyzeBtnText}>Analyze & Secure in Vault 🔒</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.recentSection}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.recentTitle}>Recent Secure Documents</Text>
                            <TouchableOpacity 
                                style={styles.unlockBtn} 
                                onPress={() => {
                                    if (isVaultVerified) router.push('/vault');
                                    else setIsVaultModalOpen(true);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.unlockText}>{isVaultVerified ? 'Go to Vault' : 'Unlock Vault'}</Text>
                                <ArrowRight size={14} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                        {vaultReports.length === 0 ? (
                            <View style={styles.vaultHiddenCard}>
                                <Lock size={44} color="#E2E8F0" strokeWidth={1.5} />
                                <Text style={styles.vaultHiddenTitle}>Vault Content Hidden</Text>
                                <Text style={styles.vaultHiddenSub}>Verify your PIN in the Vault tab to see recent reports.</Text>
                            </View>
                        ) : (
                            <View style={styles.recentList}>
                                {vaultReports.map((report) => (
                                    <TouchableOpacity 
                                        key={report._id} 
                                        style={styles.recentCard}
                                        onPress={() => router.push('/vault')}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.recentIconBox}>
                                            <FileText size={20} color={theme.mutedForeground} />
                                        </View>
                                        <View style={styles.recentInfo}>
                                            <Text style={styles.recentDocTitle} numberOfLines={1}>{report.title}</Text>
                                            <Text style={styles.recentDocMeta}>
                                                {report.category?.toUpperCase() || 'GENERAL'} • {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                            </Text>
                                        </View>
                                        <ChevronRight size={16} color={theme.mutedForeground} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <SecretVaultModal 
                isOpen={isVaultModalOpen} 
                onClose={() => setIsVaultModalOpen(false)} 
                onSuccess={() => {
                    setIsVaultVerified(true);
                    setIsVaultModalOpen(false);
                    router.push('/vault');
                }}
            />

            <SelectorModal 
                visible={selectorOpen} 
                onClose={closeSelector}
                title={selectorConfig.title}
                options={selectorConfig.options}
                onSelect={(val: string) => {
                    selectorConfig.onSelect(val);
                    closeSelector();
                }}
                pos={menuPos}
                currentVal={selectorConfig.currentVal}
                searchable={selectorConfig.title.toLowerCase().includes('language')}
                theme={theme}
                isDarkMode={isDarkMode}
            />
        </SafeAreaView>
    );
}
