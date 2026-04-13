import React, { useState } from 'react';
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
    SafeAreaView
} from 'react-native';
import { 
    Users, 
    Plus, 
    Trash2, 
    Phone, 
    Shield, 
    X, 
    UserPlus, 
    Heart,
    ArrowLeft,
    ChevronDown
} from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FamilyMember {
    id: string;
    name: string;
    relation: string;
    phone: string;
    access: 'view' | 'manage';
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
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        position: 'relative',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: 4,
    },
    addBtnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    addBtnHeaderText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    flare: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    main: {
        paddingHorizontal: 16,
    },
    addForm: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.muted,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '500',
        color: theme.foreground,
        borderWidth: 1,
        borderColor: theme.border,
    },
    dropdown: {
        backgroundColor: theme.muted,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '500',
        color: theme.foreground,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.foreground,
    },
    accessRow: {
        flexDirection: 'row',
        gap: 10,
    },
    accessTab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        backgroundColor: theme.muted,
    },
    accessTabActiveView: {
        backgroundColor: theme.isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
        borderColor: '#3B82F6',
    },
    accessTabActiveManage: {
        backgroundColor: theme.isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED',
        borderColor: '#F97316',
    },
    accessTabText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    accessTabTextActiveView: {
        color: '#2563EB',
    },
    accessTabTextActiveManage: {
        color: '#EA580C',
    },
    sumbitBtn: {
        height: 52,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
    },
    sumbitBtnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 24,
        gap: 12,
    },
    emptyState: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.muted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    emptySub: {
        fontSize: 13,
        color: theme.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 8,
        maxWidth: 260,
    },
    memberCard: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    avatarIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F97316',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    memberRelation: {
        fontSize: 12,
        color: theme.mutedForeground,
        fontWeight: '500',
    },
    memberPhoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    memberPhoneText: {
        fontSize: 11,
        color: theme.mutedForeground,
        fontWeight: '500',
    },
    memberActions: {
        alignItems: 'flex-end',
        gap: 8,
    },
    accessBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    accessBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    deleteBtn: {
        padding: 4,
    },
    infoCard: {
        marginTop: 24,
        backgroundColor: theme.muted,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.border,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.foreground,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    infoText: {
        fontSize: 12,
        color: theme.mutedForeground,
        flex: 1,
        lineHeight: 18,
    },
    infoFooter: {
        fontSize: 10,
        color: theme.mutedForeground,
        marginTop: 12,
    }
});

export default function FamilyScreen() {
    const router = useRouter();
    const { isDarkMode, theme } = useTheme();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newMember, setNewMember] = useState({ 
        name: '', 
        relation: 'Select Relation', 
        phone: '', 
        access: 'view' as 'view' | 'manage' 
    });

    const handleAdd = () => {
        if (!newMember.name || newMember.relation === 'Select Relation') {
            Alert.alert("Required Fields", "Please enter a name and select a relation.");
            return;
        }

        const member: FamilyMember = {
            id: Date.now().toString(),
            name: newMember.name,
            relation: newMember.relation,
            phone: newMember.phone,
            access: newMember.access
        };

        setMembers([member, ...members]);
        setNewMember({ name: '', relation: 'Select Relation', phone: '', access: 'view' });
        setShowAdd(false);
    };

    const removeMember = (id: string) => {
        Alert.alert(
            "Remove Member",
            "Are you sure you want to remove this family member?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => setMembers(members.filter(m => m.id !== id)) }
            ]
        );
    };

    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={isDarkMode ? ['#9a3412', '#9d174d'] : ['#F97316', '#DB2777']}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.headerTitle}>Family & Caregivers</Text>
                            <Text style={styles.headerSub}>Share your health data with trusted family members.</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.addBtnHeader} 
                            onPress={() => setShowAdd(!showAdd)}
                            activeOpacity={0.8}
                        >
                            <UserPlus size={18} color="white" />
                            <Text style={styles.addBtnHeaderText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.flare} />
                </LinearGradient>

                <View style={styles.main}>
                    {showAdd && (
                        <View style={styles.addForm}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>Add Family Member</Text>
                                <TouchableOpacity onPress={() => setShowAdd(false)}>
                                    <X size={20} color={theme.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name *</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="e.g. Ravi Kumar"
                                    placeholderTextColor={theme.mutedForeground}
                                    value={newMember.name}
                                    onChangeText={t => setNewMember({...newMember, name: t})}
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                                    <Text style={styles.inputLabel}>Relation *</Text>
                                    <TouchableOpacity style={styles.dropdown}>
                                        <Text style={[styles.dropdownText, newMember.relation === 'Select Relation' && { color: theme.mutedForeground }]}>
                                            {newMember.relation}
                                        </Text>
                                        <ChevronDown size={14} color={theme.mutedForeground} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Phone</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="Mobile No."
                                        placeholderTextColor={theme.mutedForeground}
                                        keyboardType="phone-pad"
                                        value={newMember.phone}
                                        onChangeText={t => setNewMember({...newMember, phone: t})}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Access Level</Text>
                                <View style={styles.accessRow}>
                                    <TouchableOpacity 
                                        style={[styles.accessTab, newMember.access === 'view' && styles.accessTabActiveView]}
                                        onPress={() => setNewMember({...newMember, access: 'view'})}
                                    >
                                        <Text style={[styles.accessTabText, newMember.access === 'view' && styles.accessTabTextActiveView]}>
                                            👁️ View Only
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.accessTab, newMember.access === 'manage' && styles.accessTabActiveManage]}
                                        onPress={() => setNewMember({...newMember, access: 'manage'})}
                                    >
                                        <Text style={[styles.accessTabText, newMember.access === 'manage' && styles.accessTabTextActiveManage]}>
                                            ✏️ Full Manage
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleAdd}>
                                <LinearGradient
                                    colors={isDarkMode ? ['#ea580c', '#db2777'] : ['#F97316', '#EC4899']}
                                    style={styles.sumbitBtn}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <UserPlus size={18} color="white" />
                                    <Text style={styles.sumbitBtnText}>Add Family Member</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.listContainer}>
                        {members.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconCircle}>
                                    <Users size={40} color={theme.border} />
                                </View>
                                <Text style={styles.emptyTitle}>No Family Members</Text>
                                <Text style={styles.emptySub}>
                                    Add trusted family members or caregivers who should have access to your health data in emergencies.
                                </Text>
                            </View>
                        ) : (
                            members.map(member => (
                                <View key={member.id} style={styles.memberCard}>
                                    <View style={styles.avatarIcon}>
                                        <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberRelation}>{member.relation}</Text>
                                        {member.phone && (
                                            <View style={styles.memberPhoneRow}>
                                                <Phone size={10} color={theme.mutedForeground} />
                                                <Text style={styles.memberPhoneText}>{member.phone}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.memberActions}>
                                        <View style={[
                                            styles.accessBadge, 
                                            { backgroundColor: member.access === 'manage' ? (isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED') : (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF'), 
                                              borderColor: member.access === 'manage' ? (isDarkMode ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5') : (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE') }
                                        ]}>
                                            <Shield size={10} color={member.access === 'manage' ? '#EA580C' : '#2563EB'} />
                                            <Text style={[styles.accessBadgeText, { color: member.access === 'manage' ? '#EA580C' : '#2563EB' }]}>
                                                {member.access.toUpperCase()}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeMember(member.id)} style={styles.deleteBtn}>
                                            <Trash2 size={16} color={theme.border} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>How Family Access Works</Text>
                        <View style={styles.infoRow}>
                            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                            <Text style={styles.infoText}>
                                <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>View</Text> — Can see your medications, appointments, and emergency info.
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
                            <Text style={styles.infoText}>
                                <Text style={{ color: '#F97316', fontWeight: 'bold' }}>Manage</Text> — Can add medications, book appointments, and update emergency data on your behalf.
                            </Text>
                        </View>
                        <Text style={styles.infoFooter}>
                            Family members will receive an invite link. They don't need a Yuktha account to view data.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
