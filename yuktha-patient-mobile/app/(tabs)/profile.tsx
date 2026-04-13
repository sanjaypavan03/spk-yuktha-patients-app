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
    Image,
    SafeAreaView,
    Switch,
    Modal
} from 'react-native';
import { 
    ArrowLeft, 
    Bell, 
    ChevronRight, 
    HelpCircle, 
    LogOut, 
    Moon, 
    QrCode, 
    Shield, 
    Users, 
    Edit2, 
    Check, 
    X, 
    Phone, 
    Calendar,
    HeartPulse,
    Info,
    CheckCircle2,
    Sparkles,
    Lock
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, token, API_URL, logout } = useAuth();
    const { isDarkMode, theme, toggleDarkMode } = useTheme();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [pinStage, setPinStage] = useState<'VERIFY_OLD' | 'SET_NEW'>('SET_NEW');
    const [typedPin, setTypedPin] = useState(['', '', '', '']);
    const [oldPinValue, setOldPinValue] = useState('');
    const [pinError, setPinError] = useState('');

    const openPinSettings = async () => {
        // Open immediately for better responsiveness
        setIsPinModalOpen(true);
        setIsCheckingStatus(true);
        setPinError('');
        setTypedPin(['', '', '', '']);
        setOldPinValue('');

        try {
            const res = await fetch(`${API_URL}/api/auth/vault-pin/check`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.hasPin) {
                setPinStage('VERIFY_OLD');
            } else {
                setPinStage('SET_NEW');
            }
        } catch (error) {
            setPinError("Unable to reach server. Try again.");
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handlePinSubmit = async () => {
        const pinString = typedPin.join('');
        if (pinString.length !== 4) {
            setPinError("Please enter a 4-digit PIN");
            return;
        }

        if (pinStage === 'VERIFY_OLD') {
            // Verify old PIN first
            setIsSaving(true);
            try {
                const res = await fetch(`${API_URL}/api/auth/vault-pin/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin: pinString })
                });
                const data = await res.json();
                if (data.success) {
                    setOldPinValue(pinString);
                    setPinStage('SET_NEW');
                    setTypedPin(['', '', '', '']);
                    setPinError('');
                } else {
                    setPinError("Incorrect current PIN");
                    setTypedPin(['', '', '', '']);
                }
            } catch (e) {
                setPinError("Verification failed");
            } finally {
                setIsSaving(false);
            }
            return;
        }

        // SET_NEW Stage
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/vault-pin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    pin: pinString,
                    oldPin: oldPinValue || undefined
                })
            });

            if (res.ok) {
                Alert.alert("Success", "Vault PIN updated successfully.");
                setIsPinModalOpen(false);
                setPinError('');
            } else {
                const data = await res.json();
                setPinError(data.error || "Failed to update PIN");
                setTypedPin(['', '', '', '']);
            }
        } catch (error) {
            setPinError("Service unavailable.");
        } finally {
            setIsSaving(false);
        }
    };

    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                Alert.alert("Success", "Profile updated successfully.");
                setIsEditing(false);
            } else {
                Alert.alert("Error", "Failed to update profile.");
            }
        } catch (error) {
            Alert.alert("Error", "Internal error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const qrImageUrl = user?.qrCode ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${API_URL}/api/emergency/${user.qrCode}`)}&color=02b69a` : null;

    const styles = getStyles(theme);

    const settingsItems = [
        { icon: QrCode, title: "Emergency QR", description: "View and share your code", href: "/emergency" },
        { icon: Bell, title: "Notifications", description: "Medicine reminders and alerts", action: <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#E2E8F0', true: '#10B981' }} /> },
        { icon: Moon, title: "Theme", description: "Switch to Dark Mode", action: <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#E2E8F0', true: '#10B981' }} /> },
        { icon: Users, title: "Family Members", description: "Manage caregiver access", href: "/family" },
        { icon: Lock, title: "Health Vault PIN", description: "Change your 4-digit security code", onPress: openPinSettings },
        { icon: Shield, title: "Privacy & Security", description: "Data protection settings", href: "#" },
        { icon: HelpCircle, title: "Help & Support", description: "FAQs and contact support", href: "#" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Mobile Header (Sticky Style) */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color={theme.foreground} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                </View>
                {!isEditing && (
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtnCircle}>
                        <Edit2 size={16} color={theme.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 2. Profile Header Card (1:1 with Web) */}
                <View style={styles.profileCard}>
                    <View style={styles.cardFlare} />
                    
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarBorder}>
                            <Image 
                                source={{ uri: `https://picsum.photos/seed/${user?.id || 'default'}/120/120` }} 
                                style={styles.avatar} 
                            />
                        </View>
                        <View style={styles.verifiedBadge}>
                            <Check size={12} color="white" strokeWidth={4} />
                        </View>
                    </View>

                    {isEditing ? (
                        <View style={styles.editForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={editForm.name}
                                    placeholderTextColor={theme.mutedForeground}
                                    onChangeText={t => setEditForm({...editForm, name: t})}
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <View style={styles.labelRow}>
                                        <Phone size={12} color={theme.mutedForeground} />
                                        <Text style={styles.inputLabel}>Mobile</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.input} 
                                        value={editForm.phone}
                                        keyboardType="phone-pad"
                                        placeholderTextColor={theme.mutedForeground}
                                        onChangeText={t => setEditForm({...editForm, phone: t})}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <View style={styles.labelRow}>
                                        <Calendar size={12} color={theme.mutedForeground} />
                                        <Text style={styles.inputLabel}>DOB</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.input} 
                                        value={editForm.dateOfBirth}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={theme.mutedForeground}
                                        onChangeText={t => setEditForm({...editForm, dateOfBirth: t})}
                                    />
                                </View>
                            </View>
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Profile'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoContainer}>
                            <Text style={styles.userName}>{user?.name}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                            
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Mobile</Text>
                                    <Text style={styles.statValue}>{user?.phone || '—'}</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Born</Text>
                                    <Text style={styles.statValue}>
                                        {user?.dateOfBirth ? new Date(user.dateOfBirth).getFullYear() : '—'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* 3. Health Overview Stats */}
                <View style={styles.healthStatsGrid}>
                    <View style={[styles.healthStatCard, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4' }]}>
                        <Text style={[styles.healthStatValue, { color: isDarkMode ? '#34D399' : '#166534' }]}>92%</Text>
                        <Text style={styles.healthStatLabel}>Adherence</Text>
                    </View>
                    <View style={[styles.healthStatCard, { backgroundColor: isDarkMode ? '#312E81' : '#EEF2FF' }]}>
                        <Text style={[styles.healthStatValue, { color: isDarkMode ? '#818CF8' : '#3730A3' }]}>4</Text>
                        <Text style={styles.healthStatLabel}>Active Meds</Text>
                    </View>
                    <View style={[styles.healthStatCard, { backgroundColor: isDarkMode ? '#78350F' : '#FFF7ED' }]}>
                        <Text style={[styles.healthStatValue, { color: isDarkMode ? '#FB923C' : '#9A3412' }]}>12</Text>
                        <Text style={styles.healthStatLabel}>Streak</Text>
                    </View>
                </View>

                {/* 4. Emergency QR Card (1:1 with Web) */}
                <View style={styles.qrCard}>
                    <View style={styles.qrBadge}>
                        <QrCode size={14} color="#F43F5E" strokeWidth={2.5} />
                        <Text style={styles.qrBadgeText}>Live Emergency ID</Text>
                    </View>
                    <Text style={styles.qrCardTitle}>Your Secure Digital Wallet</Text>
                    
                    <View style={styles.qrDisplayContainer}>
                        {qrImageUrl ? (
                            <View style={styles.qrImageBg}>
                                <Image source={{ uri: qrImageUrl }} style={styles.qrImage} />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.generateBtn}>
                                <Text style={styles.generateBtnText}>Generate Emergency QR Code</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.qrDesc}>
                            Enable paramedics to access your critical medical data <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>instantly</Text> in case of an emergency.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.manageBtn} 
                        onPress={() => router.push('/emergency')}
                    >
                        <Text style={styles.manageBtnText}>Manage Security Settings</Text>
                        <ChevronRight size={16} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* 5. Settings List (Clean Production List) */}
                <View style={styles.settingsCard}>
                    <Text style={styles.settingsSectionTitle}>Preference & Privacy</Text>
                    <View style={styles.settingsList}>
                        {settingsItems.map((item, i) => (
                            <TouchableOpacity 
                                key={i} 
                                style={styles.settingsItem}
                                onPress={() => {
                                    if (item.onPress) item.onPress();
                                    else if (item.href) router.push(item.href as any);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.settingsIconBox}>
                                    <item.icon size={20} color={theme.primary} strokeWidth={2.2} />
                                </View>
                                <View style={styles.settingsInfo}>
                                    <Text style={styles.settingsItemTitle}>{item.title}</Text>
                                    <Text style={styles.settingsItemDesc}>{item.description}</Text>
                                </View>
                                {item.action ? item.action : <ChevronRight size={18} color={theme.mutedForeground} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 6. Secure Sign Out */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LogOut size={20} color={theme.danger} strokeWidth={2.5} />
                    <Text style={styles.logoutText}>Disconnect Account</Text>
                </TouchableOpacity>

                <Modal
                    visible={isPinModalOpen}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsPinModalOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.pinModalContainer}>
                            <View style={styles.pinModalHeader}>
                                <View style={styles.lockIconBox}>
                                    <Lock size={24} color={theme.primary} />
                                </View>
                                <Text style={styles.pinModalTitle}>
                                    {pinStage === 'VERIFY_OLD' ? 'Verify Current PIN' : 'Set Vault PIN'}
                                </Text>
                                <Text style={styles.pinModalSub}>
                                    {pinStage === 'VERIFY_OLD' 
                                        ? 'Enter your existing code to continue' 
                                        : 'Set a new 4-digit code to protect your records'}
                                </Text>
                            </View>

                            {isCheckingStatus ? (
                                <View style={{ padding: 40 }}>
                                    <ActivityIndicator size="large" color={theme.primary} />
                                    <Text style={[styles.pinModalSub, { marginTop: 12 }]}>Checking security state...</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.pinDisplayRow}>
                                        {[0, 1, 2, 3].map((idx) => (
                                            <View 
                                                key={idx} 
                                                style={[
                                                    styles.pinBox, 
                                                    typedPin[idx] !== '' && { borderColor: theme.primary, backgroundColor: theme.accent }
                                                ]}
                                            >
                                                <Text style={styles.pinBoxText}>{typedPin[idx] ? '•' : ''}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

                                    <View style={styles.pinKeypad}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((val) => (
                                            <TouchableOpacity 
                                                key={val}
                                                style={[
                                                    styles.pinKey,
                                                    val === '✓' && { backgroundColor: theme.primary }
                                                ]}
                                                onPress={() => {
                                                    if (val === 'C') {
                                                        setTypedPin(['', '', '', '']);
                                                    } else if (val === '✓') {
                                                        handlePinSubmit();
                                                    } else {
                                                        const idx = typedPin.findIndex(p => p === '');
                                                        if (idx !== -1) {
                                                            const p = [...typedPin];
                                                            p[idx] = val.toString();
                                                            setTypedPin(p);
                                                        }
                                                    }
                                                }}
                                            >
                                                {val === '✓' ? (
                                                    <Check size={20} color="white" strokeWidth={3} />
                                                ) : (
                                                    <Text style={[styles.pinKeyText, val === '✓' && { color: 'white' }]}>{val}</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <TouchableOpacity 
                                style={styles.closePinBtn} 
                                onPress={() => {
                                    setIsPinModalOpen(false);
                                    setTypedPin(['', '', '', '']);
                                    setPinError('');
                                }}
                            >
                                <Text style={styles.closePinBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.muted,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    editBtnCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCard: {
        margin: 16,
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
        position: 'relative',
    },
    cardFlare: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        backgroundColor: theme.accent,
        borderRadius: 60,
        opacity: 0.5,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    avatarBorder: {
        borderWidth: 4,
        borderColor: theme.card,
        borderRadius: 56,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.primary,
        borderWidth: 2,
        borderColor: theme.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
    },
    userEmail: {
        fontSize: 15,
        color: theme.mutedForeground,
        fontWeight: '500',
        marginTop: 4,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: theme.border,
    },
    editForm: {
        width: '100%',
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginLeft: 4,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: theme.muted,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        fontWeight: '500',
        color: theme.foreground,
        borderWidth: 1,
        borderColor: theme.border,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.muted,
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    saveBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primary,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    healthStatsGrid: {
        flexDirection: 'row',
        marginHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    healthStatCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    healthStatValue: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    healthStatLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    qrCard: {
        marginHorizontal: 16,
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 4,
        marginBottom: 24,
    },
    qrBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.isDarkMode ? '#450a0a' : '#FFF1F2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? '#7f1d1d' : '#FFE4E6',
        marginBottom: 16,
    },
    qrBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.danger,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    qrCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        marginBottom: 24,
        textAlign: 'center',
    },
    qrDisplayContainer: {
        alignItems: 'center',
        gap: 20,
    },
    qrImageBg: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 28,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 60,
        elevation: 10,
        borderWidth: 1,
        borderColor: theme.border,
    },
    qrImage: {
        width: 180,
        height: 180,
    },
    generateBtn: {
        height: 56,
        paddingHorizontal: 24,
        backgroundColor: theme.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    qrDesc: {
        fontSize: 13,
        color: theme.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
        paddingHorizontal: 20,
    },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        paddingVertical: 8,
    },
    manageBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.primary,
    },
    settingsCard: {
        marginHorizontal: 16,
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 24,
    },
    settingsSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 2.5,
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 16,
    },
    settingsList: {
        gap: 4,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 20,
    },
    settingsIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsInfo: {
        flex: 1,
    },
    settingsItemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    settingsItemDesc: {
        fontSize: 13,
        color: theme.mutedForeground,
        fontWeight: '500',
        marginTop: 2,
    },
    logoutBtn: {
        marginHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 12,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '900',
        color: theme.danger,
        letterSpacing: -0.2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pinModalContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    pinModalHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    lockIconBox: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: theme.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    pinModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    pinModalSub: {
        fontSize: 13,
        color: theme.mutedForeground,
        marginTop: 4,
        textAlign: 'center',
    },
    pinDisplayRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    pinBox: {
        width: 50,
        height: 60,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.border,
        backgroundColor: theme.muted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinBoxText: {
        fontSize: 24,
        color: theme.foreground,
        fontWeight: 'bold',
    },
    pinErrorText: {
        color: theme.danger,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    pinKeypad: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    pinKey: {
        width: '28%',
        aspectRatio: 1.5,
        borderRadius: 16,
        backgroundColor: theme.muted,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    pinKeyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    closePinBtn: {
        padding: 12,
    },
    closePinBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    }
});
