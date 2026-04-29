import React, { useState, useEffect, useRef } from "react";
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    Dimensions,
    Platform,
    Animated,
    LayoutAnimation
} from "react-native";
import { Pill, Plus, Check, Clock, Trash2, X, Camera, RefreshCw } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { format } from "date-fns";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRESET_TIMES = [
    { label: 'Morning', time: '08:00 AM', icon: '☀️' },
    { label: 'Afternoon', time: '01:00 PM', icon: '🌤️' },
    { label: 'Evening', time: '07:00 PM', icon: '🌆' },
    { label: 'Night', time: '10:00 PM', icon: '🌙' },
];

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        paddingHorizontal: 28,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
    },
    headerDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ECFDF5',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        opacity: 0.8,
        marginTop: 4,
    },
    headerAddBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 4,
    },
    headerAddBackdrop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 40,
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    headerAddText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    main: {
        paddingHorizontal: 16,
    },
    addCard: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.08,
        shadowRadius: 40,
        elevation: 10,
        borderWidth: 1,
        borderColor: theme.border,
    },
    addHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    addCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    addCloseBtn: {
        padding: 4,
    },
    formContent: {
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingLeft: 4,
    },
    input: {
        backgroundColor: theme.muted,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        fontWeight: '500',
        color: theme.foreground,
    },
    scheduleGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 4,
    },
    scheduleSlot: {
        flex: 1,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 4,
    },
    scheduleSlotActive: {
        backgroundColor: theme.accent,
        borderColor: theme.primary,
    },
    slotIconText: {
        fontSize: 18,
    },
    slotLabelText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    slotLabelActiveText: {
        color: theme.accentForeground,
    },
    slotTimeText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    saveBtn: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 14,
        gap: 12,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 6,
        marginTop: 8,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    scanBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10B981',
    },
    extractingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    extractingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#10B981',
        fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    section: {
        marginTop: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    countBadge: {
        backgroundColor: theme.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.accentForeground,
    },
    medicationList: {
        gap: 16,
    },
    medCard: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
    },
    medIconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: theme.muted,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    medDetails: {
        flex: 1,
    },
    medName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        lineHeight: 22,
    },
    medMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
    },
    dosageLabel: {
        backgroundColor: theme.muted,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    dosageLabelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
    },
    timeTagList: {
        flexDirection: 'row',
        gap: 6,
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.muted,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    timeTagText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    trashBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    emptyStateCard: {
        backgroundColor: theme.card,
        borderRadius: 28,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    emptyStateSub: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.mutedForeground,
        marginTop: 4,
    },
    historySectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    historyGroups: {
        gap: 32,
    },
    historyGroup: {
        gap: 12,
    },
    historyDateLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        paddingHorizontal: 12,
    },
    historyList: {
        gap: 12,
    },
    historyItem: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    historyIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyInfo: {
        flex: 1,
    },
    historyItemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    historyItemMeta: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        marginTop: 2,
    },
    historyEmptyText: {
        textAlign: 'center',
        color: theme.mutedForeground,
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 40,
    },
    skeletonList: {
        gap: 16,
    },
    skeletonCard: {
        height: 96,
        backgroundColor: theme.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: 0.5,
    }
});

const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today's History";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return format(date, 'EEEE, MMM do');
};

export default function MedTrackerScreen() {
    const { user, token, API_URL } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const [medicines, setMedicines] = useState<any[]>([]);
    const [history, setHistory] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [isExtracting, setIsExtracting] = useState(false);
    
    const [newMed, setNewMed] = useState<{
        name: string;
        dosage: string;
        frequency: string;
        times: string[];
        notes: string;
    }>({ name: '', dosage: '', frequency: 'Once daily', times: ['08:00 AM'], notes: '' });

    const handleScanBottle = async () => {
        Alert.alert(
            "Scan Medication",
            "How would you like to provide the photo?",
            [
                {
                    text: "Take Photo",
                    onPress: () => openPicker(true)
                },
                {
                    text: "Choose from Gallery",
                    onPress: () => openPicker(false)
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const openPicker = async (isCamera: boolean) => {
        try {
            const permission = isCamera 
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert("Permission Required", "Camera/Gallery access is needed for this feature.");
                return;
            }

            const result = isCamera
                ? await ImagePicker.launchCameraAsync({
                    base64: true,
                    quality: 0.5,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    base64: true,
                    quality: 0.5,
                });

            if (!result.canceled && result.assets[0].base64) {
                performExtraction(result.assets[0].base64);
            }
        } catch (e) {
            Alert.alert("Error", "Could not open camera/gallery.");
        }
    };

    const performExtraction = async (base64: string) => {
        setIsExtracting(true);
        try {
            const res = await fetch(`${API_URL}/api/medicines/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    imageDataUri: `data:image/jpeg;base64,${base64}` 
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.medications && data.medications.length > 0) {
                    const extracted = data.medications[0];
                    setNewMed(prev => ({
                        ...prev,
                        name: extracted.name || prev.name,
                        dosage: extracted.dosage || prev.dosage
                    }));
                } else {
                    Alert.alert("Extraction Result", "No medication found in the photo. Please try a clearer picture.");
                }
            } else {
                Alert.alert("Analysis Failed", "Could not analyze the medicine bottle.");
            }
        } catch (e) {
            Alert.alert("Error", "Network error during analysis.");
        } finally {
            setIsExtracting(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
        fetchHistory();
    }, [token]);

    const fetchMedicines = async () => {
        try {
            const res = await fetch(`${API_URL}/api/medicines`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setMedicines(json.data || []);
            }
        } catch (error) {
            console.error("Fetch meds error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/patient/pills/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history || {});
            }
        } catch (error) {
            console.error("Fetch history error:", error);
        }
    };

    const toggleAddForm = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAddForm(!showAddForm);
    };

    const handleAddMedicine = async () => {
        if (!newMed.name || !newMed.dosage || newMed.times.length === 0) {
            Alert.alert("Error", "Name, dosage, and at least one time are required.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/medicines`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newMed.name,
                    dosage: newMed.dosage,
                    times: newMed.times,
                    frequency: newMed.frequency,
                    instructions: newMed.notes
                })
            });

            if (res.ok) {
                setNewMed({ name: '', dosage: '', frequency: 'Once daily', times: ['08:00 AM'], notes: '' });
                toggleAddForm();
                fetchMedicines();
            } else {
                Alert.alert("Save Failed", "Could not add medication.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error while saving.");
        }
    };

    const toggleTimeInSchedule = (time: string) => {
        if (newMed.times.includes(time)) {
            setNewMed(prev => ({ ...prev, times: prev.times.filter(t => t !== time) }));
        } else {
            setNewMed(prev => ({ ...prev, times: [...prev.times, time] }));
        }
    };

    const removeMedicine = async (medId: string, medName: string) => {
        Alert.alert(
            "Remove Medication",
            `Stop taking ${medName} entirely? This will remove it from your schedule.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const res = await fetch(`${API_URL}/api/medicines/${medId}`, { 
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) fetchMedicines();
                    } catch (e) {
                        Alert.alert("Error", "Failed to delete.");
                    }
                }}
            ]
        );
    };

    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={true}>
                {/* 1. Premium Emerald Header (1:1 with Web) */}
                <LinearGradient
                    colors={isDarkMode ? ['#064E3B', '#022C22'] : ['#10B981', '#059669']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >

                    <View style={styles.headerContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Med Tracker</Text>
                            <Text style={styles.headerDate}>{format(new Date(), 'EEEE, MMMM do')}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={toggleAddForm}
                            activeOpacity={0.8}
                            style={styles.headerAddBtn}
                        >
                            <View style={styles.headerAddBackdrop}>
                                <Plus size={16} color="white" strokeWidth={3} />
                                <Text style={styles.headerAddText}>Add Pill</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={[styles.main, { marginTop: Platform.OS === 'ios' ? -16 : 0 }]}>
                    {/* 2. Add New Medication Form (Collapsible Card) */}
                    {showAddForm && (
                        <View style={styles.addCard}>
                            <View style={styles.addHeader}>
                                <Text style={styles.addCardTitle}>Add New Medication</Text>
                                <TouchableOpacity onPress={toggleAddForm} style={styles.addCloseBtn}>
                                    <X size={20} color={theme.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            {isExtracting && (
                                <View style={styles.extractingOverlay}>
                                    <View style={{ backgroundColor: '#ECFDF5', padding: 20, borderRadius: 20, alignItems: 'center' }}>
                                        <ActivityIndicator size="large" color="#10B981" />
                                        <Text style={styles.extractingText}>Analyzing Medication...</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.formContent}>
                                <View style={styles.inputGroup}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={styles.label}>Medicine Name</Text>
                                        <TouchableOpacity 
                                            style={styles.scanBtn}
                                            onPress={handleScanBottle}
                                            disabled={isExtracting}
                                        >
                                            <Camera size={14} color="#10B981" />
                                            <Text style={styles.scanBtnText}>Scan Medication</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="e.g. Paracetamol"
                                        placeholderTextColor={theme.mutedForeground}
                                        value={newMed.name}
                                        onChangeText={text => setNewMed({...newMed, name: text})}
                                    />
                                </View>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Dosage</Text>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="e.g. 500mg"
                                        placeholderTextColor={theme.mutedForeground}
                                        value={newMed.dosage}
                                        onChangeText={text => setNewMed({...newMed, dosage: text})}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Schedule (Tap to select multiple)</Text>
                                    <View style={styles.scheduleGrid}>
                                        {PRESET_TIMES.map((slot) => (
                                            <TouchableOpacity
                                                key={slot.time}
                                                activeOpacity={0.7}
                                                style={[
                                                    styles.scheduleSlot,
                                                    newMed.times.includes(slot.time) && styles.scheduleSlotActive
                                                ]}
                                                onPress={() => toggleTimeInSchedule(slot.time)}
                                            >
                                                <Text style={styles.slotIconText}>{slot.icon}</Text>
                                                <Text style={[styles.slotLabelText, newMed.times.includes(slot.time) && styles.slotLabelActiveText]}>
                                                    {slot.label}
                                                </Text>
                                                <Text style={styles.slotTimeText}>{slot.time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Notes (optional)</Text>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="e.g. Take after breakfast"
                                        placeholderTextColor={theme.mutedForeground}
                                        value={newMed.notes}
                                        onChangeText={text => setNewMed({...newMed, notes: text})}
                                    />
                                </View>

                                <TouchableOpacity 
                                    style={styles.saveBtn} 
                                    onPress={handleAddMedicine}
                                    activeOpacity={0.9}
                                >
                                    <Plus size={20} color="white" strokeWidth={3} />
                                    <Text style={styles.saveBtnText}>Save Medication</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* 3. Your Medications List */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Your Medications</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{medicines.length} Total</Text>
                            </View>
                        </View>

                        {loading ? (
                            <View style={styles.skeletonList}>
                                {[1, 2].map(i => <View key={i} style={styles.skeletonCard} />)}
                            </View>
                        ) : medicines.length === 0 ? (
                            <View style={styles.emptyStateCard}>
                                <View style={styles.emptyIconCircle}>
                                    <Pill size={32} color={theme.primary} />
                                </View>
                                <Text style={styles.emptyStateTitle}>No Medications Added</Text>
                                <Text style={styles.emptyStateSub}>Start by adding your first pill tracker.</Text>
                            </View>
                        ) : (
                            <View style={styles.medicationList}>
                                {medicines.map((med) => (
                                    <View key={med._id} style={styles.medCard}>
                                        <View style={styles.medIconBox}>
                                            <Pill size={24} color={theme.mutedForeground} strokeWidth={2.2} />
                                        </View>
                                        <View style={styles.medDetails}>
                                            <Text style={styles.medName} numberOfLines={1}>
                                                {med.medicineName || med.name || 'Medication'}
                                            </Text>
                                            <View style={styles.medMetaRow}>
                                                <View style={styles.dosageLabel}>
                                                    <Text style={styles.dosageLabelText}>{med.dosage}</Text>
                                                </View>
                                                <View style={styles.timeTagList}>
                                                    {med.times?.map((t: string, idx: number) => (
                                                        <View key={idx} style={styles.timeTag}>
                                                            <Clock size={12} color={theme.mutedForeground} />
                                                            <Text style={styles.timeTagText}>{t}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.trashBtn}
                                            onPress={() => removeMedicine(med._id, med.medicineName || med.name)}
                                        >
                                            <Trash2 size={20} color={theme.mutedForeground} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* 4. Medical History Section */}
                    <View style={[styles.section, { marginTop: 40 }]}>
                        <View style={styles.historySectionHeader}>
                            <Clock size={20} color={theme.mutedForeground} />
                            <Text style={styles.sectionTitle}>Medical History</Text>
                        </View>

                        {Object.keys(history).filter(date => date !== new Date().toISOString().split('T')[0]).length === 0 ? (
                            <Text style={styles.historyEmptyText}>No past history recorded yet.</Text>
                        ) : (
                            <View style={styles.historyGroups}>
                                {Object.entries(history)
                                    .filter(([date]) => date !== new Date().toISOString().split('T')[0])
                                    .map(([date, items]) => (
                                    <View key={date} style={styles.historyGroup}>
                                        <Text style={styles.historyDateLabel}>{formatDateHeader(date)}</Text>
                                        <View style={styles.historyList}>
                                            {items.map((item: any) => (
                                                <View key={item._id} style={styles.historyItem}>
                                                    <View style={[
                                                        styles.historyIconBox, 
                                                        { backgroundColor: item.taken ? theme.accent : (isDarkMode ? '#450a0a' : '#FFF1F2') }
                                                    ]}>
                                                        {item.taken ? 
                                                            <Check size={18} color={theme.accentForeground} strokeWidth={3} /> : 
                                                            <X size={18} color={theme.danger} strokeWidth={3} />
                                                        }
                                                    </View>
                                                    <View style={styles.historyInfo}>
                                                        <Text style={styles.historyItemName}>{item.medicineName}</Text>
                                                        <Text style={styles.historyItemMeta}>{item.scheduledTime} • {item.taken ? 'Taken' : 'Skipped'}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
