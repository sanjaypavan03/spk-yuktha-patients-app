import React, { useState, useEffect } from 'react'; 
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    Dimensions,
    Modal,
    TextInput,
    Platform,
    SafeAreaView
} from 'react-native';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Hospital, 
    FileText, 
    ChevronRight, 
    Plus, 
    X,
    ChevronDown,
    Search
} from "lucide-react-native";
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        backgroundColor: theme.background,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
    },
    bookBtn: {
        backgroundColor: theme.primary,
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 6,
    },
    bookBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 110,
        paddingHorizontal: 16,
    },
    list: {
        gap: 16,
    },
    card: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
    },
    cardTop: {
        backgroundColor: theme.muted,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        gap: 12,
    },
    cardDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardDateText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    cardTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTimeText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.mutedForeground,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginLeft: 'auto',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    cardMain: {
        padding: 20,
    },
    cardReason: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.foreground,
        marginBottom: 8,
    },
    cardHospitalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    cardHospitalText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.foreground,
        opacity: 0.8,
    },
    cardDocRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardDocText: {
        fontSize: 14,
        color: theme.mutedForeground,
        fontWeight: '500',
    },
    cardDocSpec: {
        fontSize: 12,
        opacity: 0.7,
    },
    cardChevron: {
        position: 'absolute',
        right: 12,
        bottom: 20,
    },
    emptyCard: {
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        marginTop: 20,
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    emptySub: {
        fontSize: 14,
        color: theme.mutedForeground,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    skeletonCard: {
        height: 140,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: 0.5,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '100%',
        backgroundColor: theme.card,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 50,
        elevation: 20,
    },
    modalHeader: {
        backgroundColor: theme.primary,
        padding: 24,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#ECFDF5',
        marginTop: 4,
        fontWeight: '500',
        opacity: 0.8,
    },
    modalCloseBtn: {
        position: 'absolute',
        top: 24,
        right: 20,
    },
    modalBody: {
        padding: 20,
        gap: 16,
    },
    formGroup: {
        gap: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    hospitalList: {
        gap: 8,
    },
    hospitalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.muted,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
    },
    hospitalItemActive: {
        backgroundColor: theme.accent,
        borderColor: theme.primary,
    },
    hospitalLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.mutedForeground,
    },
    hospitalLabelActive: {
        color: theme.primary,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: theme.muted,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: theme.foreground,
    },
    loadingSlots: {
        fontSize: 13,
        color: theme.mutedForeground,
        fontStyle: 'italic',
        marginLeft: 4,
    },
    noSlotsBox: {
        backgroundColor: theme.isDarkMode ? 'rgba(244,63,94,0.1)' : '#FEF2F2',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(244,63,94,0.2)' : '#FEE2E2',
    },
    noSlotsText: {
        fontSize: 13,
        color: theme.danger,
        fontWeight: '500',
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    slotBtn: {
        width: (SCREEN_WIDTH - 32 - 40 - 18) / 4,
        paddingVertical: 8,
        backgroundColor: theme.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
    },
    slotBtnActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    slotText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    },
    slotTextActive: {
        color: '#FFF',
    },
    textarea: {
        backgroundColor: theme.muted,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: theme.foreground,
        height: 60,
        textAlignVertical: 'top',
    },
    confirmBtn: {
        backgroundColor: theme.foreground,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    confirmBtnText: {
        color: theme.background,
        fontSize: 15,
        fontWeight: 'bold',
    }
});

export default function AppointmentsScreen() {
    const { user, token, API_URL } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Booking Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
        fetchHospitals();
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
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHospitals = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHospitals(data.hospitals || []);
            }
        } catch (error) {
            console.error('Failed to fetch hospitals:', error);
        }
    };

    const fetchSlots = async (hospitalId: string, date: string) => {
        if (!hospitalId || !date) return;
        setSlotsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/appointments/slots?hospitalId=${hospitalId}&date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableSlots(data.available || []);
                setSelectedSlot(''); 
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedHospital && selectedDate) {
            fetchSlots(selectedHospital, selectedDate);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedHospital, selectedDate]);

    const handleBook = async () => {
        if (!selectedHospital || !selectedDate || !selectedSlot || !reason) {
            Alert.alert('Missing Info', 'Please fill all fields');
            return;
        }

        setBookingLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/appointments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hospitalId: selectedHospital,
                    date: selectedDate,
                    timeSlot: selectedSlot,
                    reason
                })
            });

            if (res.ok) {
                Alert.alert('Success', 'Appointment booked successfully!');
                setIsModalOpen(false);
                setSelectedHospital('');
                setSelectedDate('');
                setSelectedSlot('');
                setReason('');
                fetchAppointments(); 
            } else {
                const errData = await res.json();
                Alert.alert('Error', errData.error || 'Failed to book');
            }
        } catch (error) {
            Alert.alert('Error', 'Internal error occurred');
        } finally {
            setBookingLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return { bg: isDarkMode ? '#064E3B' : '#DCFCE7', text: isDarkMode ? '#34D399' : '#15803D' };
            case 'cancelled': return { bg: isDarkMode ? '#450a0a' : '#FEE2E2', text: isDarkMode ? '#FB7185' : '#B91C1C' };
            case 'no_show': return { bg: isDarkMode ? '#431407' : '#FFEDD5', text: isDarkMode ? '#FB923C' : '#C2410C' };
            default: return { bg: isDarkMode ? '#1E3A8A' : '#DBEAFE', text: isDarkMode ? '#93C5FD' : '#1D4ED8' };
        }
    };

    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Your Appointments</Text>
                <TouchableOpacity 
                    style={styles.bookBtn} 
                    onPress={() => setIsModalOpen(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.bookBtnText}>Book Visit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <View style={styles.list}>
                        {[1, 2, 3].map(i => (
                            <View key={i} style={styles.skeletonCard} />
                        ))}
                    </View>
                ) : appointments.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <View style={styles.emptyIconBox}>
                            <CalendarIcon size={32} color={isDarkMode ? theme.secondary : "#3B82F6"} />
                        </View>
                        <Text style={styles.emptyTitle}>No Appointments</Text>
                        <Text style={styles.emptySub}>You haven't booked any medical visits yet. Tap 'Book Visit' to schedule one.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {appointments.map((appt) => {
                            const styles_status = getStatusStyles(appt.status);
                            return (
                                <View key={appt._id} style={styles.card}>
                                    <View style={styles.cardTop}>
                                        <View style={styles.cardDateRow}>
                                            <CalendarIcon size={14} color={theme.primary} strokeWidth={2.5} />
                                            <Text style={styles.cardDateText}>
                                                {format(new Date(appt.date), 'MMM do, yyyy')}
                                            </Text>
                                        </View>
                                        <View style={styles.cardTimeRow}>
                                            <Clock size={14} color={theme.mutedForeground} />
                                            <Text style={styles.cardTimeText}>{appt.timeSlot}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: styles_status.bg }]}>
                                            <Text style={[styles.statusText, { color: styles_status.text }]}>
                                                {appt.status.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.cardMain}>
                                        <Text style={styles.cardReason} numberOfLines={1}>{appt.reason}</Text>
                                        
                                        <View style={styles.cardHospitalRow}>
                                            <Hospital size={14} color={theme.mutedForeground} />
                                            <Text style={styles.cardHospitalText}>
                                                {appt.hospitalId?.name || 'Unknown Hospital'}
                                            </Text>
                                        </View>

                                        {appt.doctorId && (
                                            <View style={styles.cardDocRow}>
                                                <FileText size={14} color={theme.mutedForeground} />
                                                <Text style={styles.cardDocText}>
                                                    Dr. {appt.doctorId?.name} <Text style={styles.cardDocSpec}>({appt.doctorId?.specialty})</Text>
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.cardChevron}>
                                        <ChevronRight size={18} color={theme.border} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <Modal visible={!!isModalOpen} transparent={true} animationType="fade">
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsModalOpen(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Book Appointment</Text>
                            <Text style={styles.modalSubtitle}>Schedule a visit at a Yuktha hospital.</Text>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsModalOpen(false)}>
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Select Hospital</Text>
                                <View style={styles.hospitalList}>
                                    {hospitals.map(h => (
                                        <TouchableOpacity 
                                            key={h._id}
                                            onPress={() => setSelectedHospital(h._id)}
                                            style={[
                                                styles.hospitalItem,
                                                selectedHospital === h._id && styles.hospitalItemActive
                                            ]}
                                        >
                                            <Hospital size={16} color={selectedHospital === h._id ? theme.primary : theme.mutedForeground} />
                                            <Text style={[
                                                styles.hospitalLabel,
                                                selectedHospital === h._id && styles.hospitalLabelActive
                                            ]}>
                                                {h.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Select Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.mutedForeground}
                                    value={selectedDate}
                                    onChangeText={setSelectedDate}
                                />
                            </View>

                            {selectedHospital && selectedDate && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Available Slots</Text>
                                    {slotsLoading ? (
                                        <Text style={styles.loadingSlots}>Finding slots...</Text>
                                    ) : availableSlots.length === 0 ? (
                                        <View style={styles.noSlotsBox}>
                                            <Text style={styles.noSlotsText}>No slots available for this date.</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.slotGrid}>
                                            {availableSlots.map(slot => (
                                                <TouchableOpacity
                                                    key={slot}
                                                    onPress={() => setSelectedSlot(slot)}
                                                    style={[
                                                        styles.slotBtn,
                                                        selectedSlot === slot && styles.slotBtnActive
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.slotText,
                                                        selectedSlot === slot && styles.slotTextActive
                                                    ]}>
                                                        {slot}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Reason for Visit</Text>
                                <TextInput
                                    style={styles.textarea}
                                    placeholder="e.g. Regular checkup, fever, etc."
                                    placeholderTextColor={theme.mutedForeground}
                                    multiline
                                    value={reason}
                                    onChangeText={setReason}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.confirmBtn, bookingLoading && { opacity: 0.7 }]}
                                onPress={handleBook}
                                disabled={bookingLoading}
                            >
                                <Text style={styles.confirmBtnText}>
                                    {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
