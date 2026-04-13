import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Dimensions,
    Image,
    Linking,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    Switch
} from 'react-native';
import { 
    AlertTriangle, 
    Activity, 
    Phone, 
    HeartPulse, 
    Stethoscope, 
    Droplet, 
    User as UserIcon, 
    Edit2, 
    ArrowLeft,
    X,
    Check,
    ChevronDown,
    ShieldCheck,
    Lock,
    ChevronRight,
    Search,
    CheckCircle2
} from "lucide-react-native";
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingBottom: 110,
    },
    header: {
        backgroundColor: theme.danger, 
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
        zIndex: 5,
        paddingTop: 10,
    },
    alertIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    headerDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
        maxWidth: 300,
    },
    flareLeft: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    flareRight: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    main: {
        paddingHorizontal: 16,
    },
    qrCard: {
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 32,
        marginTop: -32,
        alignItems: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 8,
        position: 'relative',
        zIndex: 20,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    qrLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 24,
    },
    qrImageContainer: {
        padding: 16,
        backgroundColor: '#FFF', // QR codes need white background typically
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.border,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: theme.muted,
        borderRadius: 16,
    },
    qrFooter: {
        fontSize: 11,
        color: theme.mutedForeground,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
        marginTop: 24,
        maxWidth: 240,
    },
    tierText: {
        color: theme.danger,
        fontWeight: 'bold',
    },
    editBtn: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        marginTop: 20,
        gap: 10,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 6,
    },
    editBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    responderSection: {
        marginTop: 40,
    },
    sectionHeadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    infoList: {
        gap: 12,
        paddingBottom: 40,
    },
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    infoIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    infoValueLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tagRed: {
        backgroundColor: theme.isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
    },
    tagTextRed: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.danger,
        textTransform: 'uppercase',
    },
    tagPurple: {
        backgroundColor: theme.isDarkMode ? 'rgba(124, 58, 237, 0.1)' : '#F5F3FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE',
    },
    tagTextPurple: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#7C3AED',
        textTransform: 'uppercase',
    },
    contactCard: {
        backgroundColor: theme.foreground,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    contactLabelSmall: {
        fontSize: 9,
        fontWeight: '900',
        color: theme.background,
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    contactName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.background,
    },
    contactRelation: {
        fontSize: 13,
        color: theme.background,
        opacity: 0.7,
        fontWeight: '500',
        marginTop: 2,
    },
    contactCallBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyInfoBox: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    emptyInfoText: {
        fontSize: 14,
        color: theme.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
    },
    skeletonList: {
        gap: 12,
    },
    skeletonItem: {
        height: 76,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#F8FAFC',
        borderRadius: 32,
        paddingBottom: 0,
        width: '100%',
        maxHeight: '90%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 25,
    },
    modalHeader: {
        backgroundColor: '#FFF',
        padding: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    modalForm: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    badgeReady: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    badgePending: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FED7AA',
    },
    badgeTextReady: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#059669',
    },
    badgeTextPending: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#EA580C',
    },
    progressBar: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
    },
    progressSegment: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E2E8F0',
    },
    progressSegmentActive: {
        backgroundColor: theme.primary,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 12,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBtnActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 1,
    },
    tabBtnTextActive: {
        color: theme.primary,
    },
    modalForm: {
        paddingHorizontal: 20,
    },
    patientCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    patientLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    patientNameMain: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    formCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 12,
    },
    modalFooter: {
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#64748B',
    },
    saveMainBtn: {
        flex: 2,
        backgroundColor: theme.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    inputSmall: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minWidth: 60,
        ...Platform.select({
            web: { outlineStyle: 'none' }
        } as any)
    },
    inputLabelNested: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    dropdownSmall: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textAreaSmall: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 80,
        textAlignVertical: 'top',
        marginTop: 8,
        ...Platform.select({
            web: { outlineStyle: 'none' }
        } as any)
    },
    switchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    implantBox: {
        backgroundColor: '#F0F9FF', 
        borderColor: '#BAE6FD',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    pregnancyBox: {
        backgroundColor: '#F5F3FF',
        borderColor: '#DDD6FE',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    gridRow: { flexDirection: 'row', gap: 12 },
    gridCol: { flex: 1 },
    surgeryRow: { 
        flexDirection: 'row', 
        gap: 8, 
        marginBottom: 8,
        width: '100%',
        alignItems: 'center'
    },
    addBtn: { marginTop: 8, padding: 8 },
    addBtnText: { color: theme.primary, fontWeight: 'bold', fontSize: 13 },
    switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    dropdownText: { fontSize: 15, color: '#1E293B' },
    selectorBackdrop: { 
        flex: 1, 
        backgroundColor: 'transparent'
    },
    floatingMenu: { 
        position: 'absolute', 
        borderRadius: 24, 
        padding: 8, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 20 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 30, 
        elevation: 30, 
        borderWidth: 1, 
        zIndex: 5000 
    },
    menuScroll: { maxHeight: 220 },
    menuItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 14, 
        marginBottom: 2 
    },
    menuItemText: { 
        fontSize: 14, 
        fontWeight: '500' 
    },
    skeletonList: { gap: 12 },
    skeletonItem: { height: 100, backgroundColor: '#F1F5F9', borderRadius: 24 },
    emptyInfoBox: { padding: 40, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
    emptyInfoText: { color: '#94A3B8', textAlign: 'center', fontSize: 14, lineHeight: 20 },
    contactLabelSmall: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    contactName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    contactCallBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
});

function SelectorModal({ visible, onClose, title, options, onSelect, pos, currentVal, searchable, theme }: any) {
    const [search, setSearch] = useState('');
    const filtered = options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase()));
    const styles = getStyles(theme);

    // Fine-tune positioning: ensure it stays within screen bounds
    const screenWidth = SCREEN_WIDTH;
    const menuWidth = pos.width;
    const adjustedLeft = Math.min(Math.max(16, pos.x), screenWidth - menuWidth - 16);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity 
                style={styles.selectorBackdrop} 
                onPress={onClose} 
                activeOpacity={1}
            >
                <View style={[
                    styles.floatingMenu, 
                    { 
                        top: pos.y + 4, 
                        left: adjustedLeft, 
                        width: menuWidth, 
                        backgroundColor: theme.card, 
                        borderColor: theme.border 
                    }
                ]}>
                    <ScrollView style={styles.menuScroll} bounces={true} showsVerticalScrollIndicator={false}>
                        {filtered.map((item: string) => (
                            <TouchableOpacity 
                                key={item} 
                                style={[
                                    styles.menuItem, 
                                    currentVal === item && { backgroundColor: theme.primary + '15' } // subtle brand tint
                                ]}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={[
                                    styles.menuItemText, 
                                    { color: theme.foreground }, 
                                    currentVal === item && { color: theme.primary, fontWeight: '700' }
                                ]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function EmergencyHubScreen() {
    const { user, token, API_URL } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const router = useRouter();

    const [medicalInfo, setMedicalInfo] = useState<any>(null);
    const [medicines, setMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState<'tier1' | 'tier2'>('tier1');
    const [selector, setSelector] = useState({ visible: false, type: '', options: [], pos: { x: 0, y: 0, width: 0 } });

    // Form State (Complete and in parity with Web)
    const [editForm, setEditForm] = useState({
        bloodGroup: '',
        knownAllergies: false,
        allergiesDetails: '',
        hasChronic: false,
        chronicConditions: '',
        hasMeds: false,
        currentMedications: '',
        emergencyContact1Name: '',
        emergencyContact1Phone: '',
        emergencyContact1Relation: '',
        hasPacemakerOrImplant: false,
        isPregnant: false,
        
        // Tier 2 Fields
        height: '',
        weight: '',
        smokingStatus: 'Never',
        alcoholUse: 'Never',
        physicalActivityLevel: 'Moderate',
        pastSurgeries: [{ name: '', year: '' }],
        emergencyContact2Name: '',
        emergencyContact2Phone: '',
        emergencyContact2Relation: '',
        familyMedicalHistory: '',
        insuranceProvider: '',
        additionalNotes: ''
    });

    const calcProgress = () => {
        let filled = 0;
        if (editForm.bloodGroup) filled++;
        if (editForm.knownAllergies ? editForm.allergiesDetails.trim() : true) filled++;
        if (editForm.hasChronic ? editForm.chronicConditions.trim() : true) filled++;
        if (editForm.hasMeds ? editForm.currentMedications.trim() : true) filled++;
        if (editForm.emergencyContact1Name.trim()) filled++;
        filled++; // Pacemaker is always a boolean value
        return filled;
    };

    const progress = calcProgress();
    const maxProgress = 6;
    const isComplete = progress === maxProgress;

    useEffect(() => {
        fetchMedicalInfo();
        fetchMedicines();
    }, [user, token]);

    const fetchMedicines = async () => {
        try {
            const res = await fetch(`${API_URL}/api/medicines`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                const meds = json.data || [];
                setMedicines(meds);
                
                // Auto-sync the med info string for the emergency file
                if (meds.length > 0) {
                    const formatted = meds.map((m: any) => `${m.name} (${m.dosage})`).join(', ');
                    setEditForm(prev => ({ 
                        ...prev, 
                        hasMeds: true,
                        currentMedications: formatted 
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch meds for emergency hub:", e);
        }
    };

    const fetchMedicalInfo = async () => {
        try {
            if (user?.qrCode) {
                const res = await fetch(`${API_URL}/api/emergency/${user.qrCode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const info = data.data;
                    setMedicalInfo(info);
                    // Pre-fill form
                    setEditForm({
                        bloodGroup: info.bloodGroup || '',
                        knownAllergies: !!info.knownAllergies,
                        allergiesDetails: info.allergiesDetails || '',
                        hasChronic: !!info.chronicConditions,
                        chronicConditions: info.chronicConditions || '',
                        hasMeds: !!info.currentMedications,
                        currentMedications: info.currentMedications || '',
                        emergencyContact1Name: info.emergencyContact1Name || '',
                        emergencyContact1Phone: info.emergencyContact1Phone || '',
                        emergencyContact1Relation: info.emergencyContact1Relation || '',
                        hasPacemakerOrImplant: !!info.hasPacemakerOrImplant,
                        isPregnant: !!info.isPregnant,

                        height: info.height || '',
                        weight: info.weight || '',
                        smokingStatus: info.smokingStatus || 'Never',
                        alcoholUse: info.alcoholUse || 'Never',
                        physicalActivityLevel: info.physicalActivityLevel || 'Moderate',
                        pastSurgeries: (info.pastSurgeries?.length > 0) ? info.pastSurgeries : [{ name: '', year: '' }],
                        emergencyContact2Name: info.emergencyContact2Name || '',
                        emergencyContact2Phone: info.emergencyContact2Phone || '',
                        emergencyContact2Relation: info.emergencyContact2Relation || '',
                        familyMedicalHistory: info.familyMedicalHistory || '',
                        insuranceProvider: info.insuranceProvider || '',
                        additionalNotes: info.additionalNotes || ''
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch medical info:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/patient/emergency-info`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                Alert.alert("Success", "Emergency information updated.");
                setIsModalOpen(false);
                fetchMedicalInfo();
            } else {
                Alert.alert("Error", "Failed to update information.");
            }
        } catch (error) {
            Alert.alert("Error", "Internal error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const qrUrl = user?.qrCode
        ? `${API_URL}/api/emergency/${user.qrCode}`
        : '';

    const qrImageUrl = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=${isDarkMode ? '0f172a' : '02b69a'}` : null;

    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={true}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={styles.backBtn}
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <View style={styles.alertIconBox}>
                            <AlertTriangle size={32} color={theme.danger} />
                        </View>
                        <Text style={styles.headerTitle}>Emergency Hub</Text>
                        <Text style={styles.headerDesc}>
                            Present this QR code to first responders or medical staff. It provides instant access to your critical, life-saving information.
                        </Text>
                    </View>
                    
                    <View style={styles.flareLeft} />
                    <View style={styles.flareRight} />
                </View>

                <View style={styles.main}>
                    <View style={styles.qrCard}>
                        <Text style={styles.qrLabel}>PUBLIC MEDICAL IDENTITY</Text>
                        
                        <View style={styles.qrImageContainer}>
                            {qrImageUrl ? (
                                <Image 
                                    source={{ uri: qrImageUrl }} 
                                    style={styles.qrImage} 
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.qrPlaceholder} />
                            )}
                        </View>

                        <Text style={styles.qrFooter}>
                            Scanning this code grants read-only access to the <Text style={styles.tierText}>Tier 1 fields</Text> displayed below.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.editBtn} 
                        onPress={() => setIsModalOpen(true)}
                        activeOpacity={0.9}
                    >
                        <Edit2 size={20} color="white" />
                        <Text style={styles.editBtnText}>Edit Emergency Information</Text>
                    </TouchableOpacity>

                    <View style={styles.responderSection}>
                        <View style={styles.sectionHeadingRow}>
                            <UserIcon size={20} color={theme.mutedForeground} />
                            <Text style={styles.sectionHeading}>What First Responders See</Text>
                        </View>

                        {loading ? (
                            <View style={styles.skeletonList}>
                                {[1, 2, 3].map(i => <View key={i} style={styles.skeletonItem} />)}
                            </View>
                        ) : !medicalInfo ? (
                            <View style={styles.emptyInfoBox}>
                                <Text style={styles.emptyInfoText}>No emergency data found. Click "Edit Emergency Information" above to complete your profile.</Text>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.infoList}>
                                    <View style={styles.infoCard}>
                                        <View style={[styles.infoIconBox, { backgroundColor: '#FFF1F2' }]}>
                                            <Droplet size={24} color="#F43F5E" />
                                        </View>
                                        <View>
                                            <Text style={styles.infoLabel}>Blood Group</Text>
                                            <Text style={styles.infoValueLarge}>{medicalInfo.bloodGroup || 'Unknown'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoCard}>
                                        <View style={[styles.infoIconBox, { backgroundColor: '#FFFBEB' }]}>
                                            <Activity size={24} color="#F59E0B" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.infoLabel}>Critical Allergies to Meds</Text>
                                            <Text style={styles.infoValue}>
                                                {medicalInfo.knownAllergies ? medicalInfo.allergiesDetails : 'None reported'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoCard}>
                                        <View style={[styles.infoIconBox, { backgroundColor: '#EEF2FF' }]}>
                                            <HeartPulse size={24} color="#6366F1" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.infoLabel}>Chronic Conditions</Text>
                                            <Text style={styles.infoValue}>
                                                {medicalInfo.chronicConditions || 'None'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoCard}>
                                        <View style={[styles.infoIconBox, { backgroundColor: '#ECFDF5' }]}>
                                            <Stethoscope size={24} color="#10B981" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.infoLabel}>Current Essential Meds</Text>
                                            <Text style={styles.infoValue}>
                                                {medicalInfo.currentMedications || 'None reported'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.tagRow}>
                                    {medicalInfo.hasPacemakerOrImplant && (
                                        <View style={styles.tagRed}>
                                            <Text style={styles.tagTextRed}>Implant / Pacemaker</Text>
                                        </View>
                                    )}
                                    {medicalInfo.isPregnant && (
                                        <View style={styles.tagPurple}>
                                            <Text style={styles.tagTextPurple}>Pregnant</Text>
                                        </View>
                                    )}
                                </View>

                                {medicalInfo.emergencyContact1Name && (
                                    <View style={styles.contactCard}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.contactLabelSmall}>Primary Emergency Contact</Text>
                                            <Text style={styles.contactName}>{medicalInfo.emergencyContact1Name}</Text>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                const name = medicalInfo.emergencyContact1Name || '';
                                                const match = name.match(/[\d\-\+\(\)\s]{8,}/);
                                                if (match) Linking.openURL(`tel:${match[0].trim()}`);
                                            }}
                                            style={styles.contactCallBtn}
                                            activeOpacity={0.8}
                                        >
                                            <Phone size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal visible={!!isModalOpen} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <Text style={styles.modalTitle}>Emergency File</Text>
                                <View style={[styles.statusBadge, isComplete ? styles.badgeReady : styles.badgePending]}>
                                    {isComplete ? (
                                        <>
                                            <Check size={14} color="#059669" />
                                            <Text style={styles.badgeTextReady}>READY</Text>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={14} color="#EA580C" />
                                            <Text style={styles.badgeTextPending}>{progress}/{maxProgress} TASKS</Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            {/* Progress Bar Segments */}
                            <View style={styles.progressBar}>
                                {[...Array(maxProgress)].map((_, i) => (
                                    <View 
                                        key={i} 
                                        style={[styles.progressSegment, i < progress && styles.progressSegmentActive]} 
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Tab Switcher */}
                        <View style={styles.tabRow}>
                            <TouchableOpacity 
                                style={[styles.tabBtn, activeTab === 'tier1' && styles.tabBtnActive]}
                                onPress={() => setActiveTab('tier1')}
                            >
                                <Text style={[styles.tabBtnText, activeTab === 'tier1' && styles.tabBtnTextActive]}>TIER 1 (CRITICAL)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.tabBtn, activeTab === 'tier2' && styles.tabBtnActive]}
                                onPress={() => setActiveTab('tier2')}
                            >
                                <Text style={[styles.tabBtnText, activeTab === 'tier2' && styles.tabBtnTextActive]}>TIER 2 (DETAILS)</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            {/* Patient Info Card */}
                            <View style={styles.patientCard}>
                                <View>
                                    <Text style={styles.patientLabel}>Patient Name</Text>
                                    <Text style={styles.patientNameMain}>{user?.name || 'Generic Patient'}</Text>

                                </View>
                                <TouchableOpacity onPress={() => { setIsModalOpen(false); router.push('/profile'); }}>
                                    <Edit2 size={18} color={theme.primary} />
                                </TouchableOpacity>
                            </View>

                            {activeTab === 'tier1' ? (
                                <View style={{ gap: 0 }}>
                                    {/* Blood Group */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formLabel}>1. Blood Group</Text>
                                        <TouchableOpacity 
                                            style={styles.dropdownSmall}
                                            onPress={(e) => {
                                                // @ts-ignore
                                                e.currentTarget.measure((x, y, w, h, px, py) => {
                                                    setSelector({
                                                        visible: true,
                                                        type: 'bloodGroup',
                                                        options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Other"] as any,
                                                        pos: { x: px, y: py + h, width: w }
                                                    });
                                                });
                                            }}
                                        >
                                            <Text style={styles.dropdownText}>{editForm.bloodGroup || 'Select Blood Group'}</Text>
                                            <ChevronDown size={18} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Allergies */}
                                    <View style={styles.formCard}>
                                        <View style={styles.switchHeader}>
                                            <Text style={styles.formLabel}>2. Known Allergies</Text>
                                            <Switch 
                                                value={editForm.knownAllergies} 
                                                onValueChange={v => setEditForm({...editForm, knownAllergies: v})}
                                                trackColor={{ false: '#E2E8F0', true: theme.primary }}
                                            />
                                        </View>
                                        {editForm.knownAllergies && (
                                            <View style={{ gap: 8, marginTop: 12 }}>
                                                <TouchableOpacity 
                                                    style={styles.dropdownSmall}
                                                    onPress={(e) => {
                                                        // @ts-ignore
                                                        e.currentTarget.measure((x, y, w, h, px, py) => {
                                                            setSelector({
                                                                visible: true,
                                                                type: 'allergiesDetails',
                                                                options: ["Penicillin", "Sulfa Drugs", "Latex", "Peanuts", "Bee Stings", "Shellfish", "Aspirin", "Other..."] as any,
                                                                pos: { x: px, y: py + h, width: w }
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>
                                                        {["Penicillin", "Sulfa Drugs", "Latex", "Peanuts", "Bee Stings", "Shellfish", "Aspirin"].includes(editForm.allergiesDetails) 
                                                            ? editForm.allergiesDetails 
                                                            : editForm.allergiesDetails ? "Other (Custom Entered)" : "Select Common Allergy"}
                                                    </Text>
                                                    <ChevronDown size={18} color="#94A3B8" />
                                                </TouchableOpacity>
                                                
                                                {(editForm.allergiesDetails && !["Penicillin", "Sulfa Drugs", "Latex", "Peanuts", "Bee Stings", "Shellfish", "Aspirin"].includes(editForm.allergiesDetails)) || editForm.allergiesDetails === "" ? (
                                                    <TextInput 
                                                        style={styles.textAreaSmall}
                                                        multiline
                                                        placeholder="Describe specifically..."
                                                        placeholderTextColor="#94A3B8"
                                                        value={editForm.allergiesDetails}
                                                        onChangeText={t => setEditForm({...editForm, allergiesDetails: t})}
                                                    />
                                                ) : null}
                                            </View>
                                        )}
                                    </View>

                                    {/* Chronic */}
                                    <View style={styles.formCard}>
                                        <View style={styles.switchHeader}>
                                            <Text style={styles.formLabel}>3. Chronic Conditions</Text>
                                            <Switch 
                                                value={editForm.hasChronic} 
                                                onValueChange={v => setEditForm({...editForm, hasChronic: v})}
                                                trackColor={{ false: '#E2E8F0', true: theme.primary }}
                                            />
                                        </View>
                                        {editForm.hasChronic && (
                                            <View style={{ gap: 8, marginTop: 12 }}>
                                                <TouchableOpacity 
                                                    style={styles.dropdownSmall}
                                                    onPress={(e) => {
                                                        // @ts-ignore
                                                        e.currentTarget.measure((x, y, w, h, px, py) => {
                                                            setSelector({
                                                                visible: true,
                                                                type: 'chronicConditions',
                                                                options: ["Type 1 Diabetes", "Type 2 Diabetes", "Hypertension", "Asthma", "Epilepsy", "Thyroid Disorder", "Other..."] as any,
                                                                pos: { x: px, y: py + h, width: w }
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>
                                                        {["Type 1 Diabetes", "Type 2 Diabetes", "Hypertension", "Asthma", "Epilepsy", "Thyroid Disorder"].includes(editForm.chronicConditions) 
                                                            ? editForm.chronicConditions 
                                                            : editForm.chronicConditions ? "Other (Custom Entered)" : "Select Common Condition"}
                                                    </Text>
                                                    <ChevronDown size={18} color="#94A3B8" />
                                                </TouchableOpacity>

                                                {(editForm.chronicConditions && !["Type 1 Diabetes", "Type 2 Diabetes", "Hypertension", "Asthma", "Epilepsy", "Thyroid Disorder"].includes(editForm.chronicConditions)) || editForm.chronicConditions === "" ? (
                                                    <TextInput 
                                                        style={styles.textAreaSmall}
                                                        multiline
                                                        placeholder="Describe condition..."
                                                        placeholderTextColor="#94A3B8"
                                                        value={editForm.chronicConditions}
                                                        onChangeText={t => setEditForm({...editForm, chronicConditions: t})}
                                                    />
                                                ) : null}
                                            </View>
                                        )}
                                    </View>

                                    {/* Medications */}
                                    <View style={styles.formCard}>
                                        <View style={styles.switchHeader}>
                                            <Text style={styles.formLabel}>4. Current Medications</Text>
                                            <View style={{ backgroundColor: theme.primary + '11', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.primary }}>AUTO-SYNCED</Text>
                                            </View>
                                        </View>
                                        
                                        {medicines.length > 0 ? (
                                            <View style={[styles.textAreaSmall, { backgroundColor: '#F1F5F9', borderStyle: 'dashed' }]}>
                                                <Text style={[styles.dropdownText, { lineHeight: 22, opacity: 0.8 }]}>
                                                    {medicines.map((m: any) => `${m.name} (${m.dosage})`).join(', ')}
                                                </Text>
                                                <TouchableOpacity 
                                                    style={{ marginTop: 8 }}
                                                    onPress={() => { setIsModalOpen(false); router.push('/(tabs)/meds'); }}
                                                >
                                                    <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700' }}>+ Edit in Med Tracker</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity 
                                                style={styles.emptyInfoBox}
                                                onPress={() => { setIsModalOpen(false); router.push('/(tabs)/meds'); }}
                                            >
                                                <Text style={styles.emptyInfoText}>No medications added yet.</Text>
                                                <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 8 }}>Open Med Tracker</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.formCard}>
                                        <Text style={styles.formLabel}>5. Primary Emergency Contact</Text>
                                        <View style={{ gap: 10, marginTop: 12 }}>
                                            <View>
                                                <Text style={styles.inputLabelNested}>Contact Name</Text>
                                                <TextInput 
                                                    style={styles.inputSmall}
                                                    placeholder="e.g. John Doe"
                                                    placeholderTextColor="#94A3B8"
                                                    value={editForm.emergencyContact1Name}
                                                    onChangeText={t => setEditForm({...editForm, emergencyContact1Name: t})}
                                                />
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <View style={{ flex: 1.5 }}>
                                                    <Text style={styles.inputLabelNested}>Phone Number</Text>
                                                    <TextInput 
                                                        style={styles.inputSmall}
                                                        placeholder="9876543210"
                                                        placeholderTextColor="#94A3B8"
                                                        keyboardType="phone-pad"
                                                        value={editForm.emergencyContact1Phone}
                                                        onChangeText={t => setEditForm({...editForm, emergencyContact1Phone: t})}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.inputLabelNested}>Relation</Text>
                                                    <TouchableOpacity 
                                                        style={styles.dropdownSmall}
                                                        onPress={(e) => {
                                                            // @ts-ignore
                                                            e.currentTarget.measure((x, y, w, h, px, py) => {
                                                                setSelector({
                                                                    visible: true,
                                                                    type: 'emergencyContact1Relation',
                                                                    options: ["Father", "Mother", "Spouse", "Sibling", "Son", "Daughter", "Friend", "Caregiver", "Other..."] as any,
                                                                    pos: { x: px, y: py + h, width: w }
                                                                });
                                                            });
                                                        }}
                                                    >
                                                        <Text style={styles.dropdownText}>
                                                            {["Father", "Mother", "Spouse", "Sibling", "Son", "Daughter", "Friend", "Caregiver"].includes(editForm.emergencyContact1Relation) 
                                                                ? editForm.emergencyContact1Relation 
                                                                : editForm.emergencyContact1Relation ? "Other..." : "Select"}
                                                        </Text>
                                                        <ChevronDown size={14} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Manual Relation Input if Other is selected or custom entry exists */}
                                            {(!["Father", "Mother", "Spouse", "Sibling", "Son", "Daughter", "Friend", "Caregiver"].includes(editForm.emergencyContact1Relation) && editForm.emergencyContact1Relation !== "") || editForm.emergencyContact1Relation === "" ? (
                                                <TextInput 
                                                    style={[styles.inputSmall, { marginTop: 4 }]}
                                                    placeholder="Specify custom relation..."
                                                    placeholderTextColor="#94A3B8"
                                                    value={editForm.emergencyContact1Relation}
                                                    onChangeText={t => setEditForm({...editForm, emergencyContact1Relation: t})}
                                                />
                                            ) : null}
                                        </View>
                                    </View>

                                    {/* Implant Toggle */}
                                    <View style={styles.implantBox}>
                                        <View style={styles.switchHeader}>
                                            <View>
                                                <Text style={[styles.formLabel, { color: theme.primary, marginBottom: 4 }]}>Pacemaker / Implant</Text>
                                                <Text style={styles.switchSub}>Do you have an electronic implant?</Text>
                                            </View>
                                            <Switch 
                                                value={editForm.hasPacemakerOrImplant} 
                                                onValueChange={v => setEditForm({...editForm, hasPacemakerOrImplant: v})}
                                                trackColor={{ false: '#BAE6FD', true: theme.primary }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ height: 20 }} />
                                </View>
                            ) : (
                                <View style={{ gap: 0 }}>
                                    {/* Demographics Card */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.patientLabel}>Demographics</Text>
                                        <View style={[styles.gridRow, { marginTop: 12 }]}>
                                            <View style={styles.gridCol}>
                                                <Text style={[styles.formLabel, { fontSize: 13 }]}>Height</Text>
                                                <TextInput 
                                                    style={styles.inputSmall}
                                                    placeholder="175cm"
                                                    placeholderTextColor="#94A3B8"
                                                    value={editForm.height}
                                                    onChangeText={t => setEditForm({...editForm, height: t})}
                                                />
                                            </View>
                                            <View style={styles.gridCol}>
                                                <Text style={[styles.formLabel, { fontSize: 13 }]}>Weight</Text>
                                                <TextInput 
                                                    style={styles.inputSmall}
                                                    placeholder="70kg"
                                                    placeholderTextColor="#94A3B8"
                                                    value={editForm.weight}
                                                    onChangeText={t => setEditForm({...editForm, weight: t})}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* Lifestyle Card */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.patientLabel}>Lifestyle</Text>
                                        <View style={{ gap: 12, marginTop: 12 }}>
                                            <View>
                                                <Text style={[styles.formLabel, { fontSize: 13, marginBottom: 8 }]}>Smoking Status</Text>
                                                <TouchableOpacity 
                                                    style={styles.dropdownSmall}
                                                    onPress={(e) => {
                                                        // @ts-ignore
                                                        e.currentTarget.measure((x, y, w, h, px, py) => {
                                                            setSelector({
                                                                visible: true,
                                                                type: 'smokingStatus',
                                                                options: ["Never", "Former Smoker", "Current Smoker"] as any,
                                                                pos: { x: px, y: py + h, width: w }
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>{editForm.smokingStatus}</Text>
                                                    <ChevronDown size={18} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                            <View>
                                                <Text style={[styles.formLabel, { fontSize: 13, marginBottom: 8 }]}>Alcohol Use</Text>
                                                <TouchableOpacity 
                                                    style={styles.dropdownSmall}
                                                    onPress={(e) => {
                                                        // @ts-ignore
                                                        e.currentTarget.measure((x, y, w, h, px, py) => {
                                                            setSelector({
                                                                visible: true,
                                                                type: 'alcoholUse',
                                                                options: ["Never", "Occasional", "Regular"] as any,
                                                                pos: { x: px, y: py + h, width: w }
                                                            });
                                                        });
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>{editForm.alcoholUse}</Text>
                                                    <ChevronDown size={18} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Surgeries Card */}
                                    <View style={styles.formCard}>
                                        <View style={styles.switchHeader}>
                                            <Text style={styles.formLabel}>Past Surgeries</Text>
                                        </View>
                                        {editForm.pastSurgeries.map((s, i) => (
                                            <View key={i} style={[styles.surgeryRow, { marginTop: i === 0 ? 8 : 0 }]}>
                                                <TextInput 
                                                    style={[styles.inputSmall, { flex: 2 }]}
                                                    placeholder="Procedure Name"
                                                    placeholderTextColor="#94A3B8"
                                                    value={s.name}
                                                    onChangeText={t => {
                                                        const newS = [...editForm.pastSurgeries];
                                                        newS[i].name = t;
                                                        setEditForm({...editForm, pastSurgeries: newS});
                                                    }}
                                                />
                                                <TextInput 
                                                    style={[styles.inputSmall, { flex: 1 }]}
                                                    placeholder="Year"
                                                    placeholderTextColor="#94A3B8"
                                                    value={s.year}
                                                    maxLength={4}
                                                    keyboardType="numeric"
                                                    onChangeText={t => {
                                                        const newS = [...editForm.pastSurgeries];
                                                        newS[i].year = t;
                                                        setEditForm({...editForm, pastSurgeries: newS});
                                                    }}
                                                />
                                            </View>
                                        ))}
                                        {editForm.pastSurgeries.length < 3 && (
                                            <TouchableOpacity 
                                                style={styles.addBtn}
                                                onPress={() => setEditForm({...editForm, pastSurgeries: [...editForm.pastSurgeries, { name: '', year: '' }]})}
                                            >
                                                <Text style={styles.addBtnText}>+ Add Surgery</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.formCard}>
                                        <Text style={styles.formLabel}>Secondary Emergency Contact</Text>
                                        <TextInput 
                                            style={styles.inputSmall}
                                            placeholder="e.g. Jane Doe - 9876543211 - Mother"
                                            placeholderTextColor="#94A3B8"
                                            value={editForm.emergencyContact2Name}
                                            onChangeText={t => setEditForm({...editForm, emergencyContact2Name: t})}
                                        />
                                    </View>

                                    <View style={styles.formCard}>
                                        <Text style={styles.formLabel}>Family Medical History</Text>
                                        <TextInput 
                                            style={styles.textAreaSmall}
                                            multiline
                                            placeholder="e.g. Father had heart attack at 55"
                                            placeholderTextColor="#94A3B8"
                                            value={editForm.familyMedicalHistory}
                                            onChangeText={t => setEditForm({...editForm, familyMedicalHistory: t})}
                                        />
                                    </View>

                                    {/* Pregnancy Card */}
                                    <View style={styles.pregnancyBox}>
                                        <View style={styles.switchHeader}>
                                            <View>
                                                <Text style={[styles.formLabel, { color: '#7C3AED', marginBottom: 4 }]}>Currently Pregnant</Text>
                                                <Text style={styles.switchSub}>Critical for emergency diagnosis</Text>
                                            </View>
                                            <Switch 
                                                value={editForm.isPregnant} 
                                                onValueChange={v => setEditForm({...editForm, isPregnant: v})}
                                                trackColor={{ false: '#DDD6FE', true: '#7C3AED' }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ height: 20 }} />
                                </View>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        {/* Sticky Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveMainBtn, isSaving && { opacity: 0.7 }]} 
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Emergency File</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <SelectorModal 
                        visible={selector.visible}
                        onClose={() => setSelector({...selector, visible: false})}
                        options={selector.options}
                        pos={selector.pos}
                        currentVal={(editForm as any)[selector.type]}
                        onSelect={(val: string) => {
                            let newVal = val;
                            // If user clicks "Other...", we clear the value so they can "Specify"
                            if (val === "Other...") {
                                newVal = "";
                            }
                            setEditForm({...editForm, [selector.type]: newVal});
                            setSelector({...selector, visible: false});
                        }}
                        theme={theme}
                    />
                </View>
            </Modal>
        </View>
    );
}
