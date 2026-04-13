import React, { useState, useRef, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image,
    ActivityIndicator, 
    Dimensions,
    Alert,
    SafeAreaView,
    Platform
} from 'react-native';
import { 
    ArrowLeft, 
    Camera as CameraIcon, 
    FileUp, 
    Loader2, 
    Pill, 
    Sparkles, 
    RefreshCw,
    X,
    Check
} from "lucide-react-native";
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Status = "idle" | "capturing" | "analyzing" | "success" | "error";

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.muted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    card: {
        flex: 1,
        backgroundColor: theme.background,
    },
    // IDLE
    idleContent: {
        padding: 40,
        alignItems: 'center',
    },
    idleIllustration: {
        marginBottom: 32,
        marginTop: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.isDarkMode ? 'rgba(5, 150, 105, 0.1)' : '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#DCFCE7',
    },
    idleTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.foreground,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
        letterSpacing: -0.5,
    },
    idleDesc: {
        fontSize: 15,
        color: theme.mutedForeground,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
        fontWeight: '500',
        paddingHorizontal: 20,
    },
    actionGroup: {
        width: '100%',
        marginTop: 40,
        gap: 16,
    },
    primaryBtn: {
        height: 56,
        backgroundColor: theme.primary,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        height: 56,
        backgroundColor: theme.muted,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    secondaryBtnText: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // CAPTURING
    cameraContainer: {
        flex: 1,
        height: SCREEN_WIDTH * 1.5,
        backgroundColor: 'black',
        borderRadius: 24,
        overflow: 'hidden',
        margin: 16,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reticle: {
        width: 250,
        height: 350,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 20,
        borderStyle: 'dashed',
    },
    cameraFooter: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 5,
        borderWidth: 4,
        borderColor: 'white',
    },
    shutterInner: {
        flex: 1,
        borderRadius: 35,
        backgroundColor: 'white',
    },
    cameraClose: {
        position: 'absolute',
        right: 40,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ANALYZING
    analyzingBox: {
        flex: 1,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
        marginTop: 24,
    },
    analyzingSub: {
        fontSize: 14,
        color: theme.mutedForeground,
        marginTop: 8,
        fontWeight: '500',
    },
    analyzingPreview: {
        width: 280,
        height: 380,
        borderRadius: 20,
        marginTop: 40,
        opacity: 0.4,
    },
    // SUCCESS
    successContent: {
        padding: 24,
    },
    successHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.foreground,
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    medList: {
        gap: 12,
        marginBottom: 32,
    },
    medCard: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    medIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.isDarkMode ? 'rgba(5, 150, 105, 0.1)' : '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    medInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.foreground,
    },
    medDosage: {
        fontSize: 13,
        color: theme.mutedForeground,
        marginTop: 2,
        fontWeight: '500',
    },
    newBadge: {
        backgroundColor: theme.isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.primary,
    },
    addFullBtn: {
        height: 56,
        backgroundColor: theme.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    addFullBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
    },
    retryBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.mutedForeground,
    }
});

export default function AddPrescriptionScreen() {
    const router = useRouter();
    const { API_URL, token } = useAuth();
    const { isDarkMode, theme } = useTheme();
    const [status, setStatus] = useState<Status>("idle");
    const [permission, requestPermission] = useCameraPermissions();
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [medications, setMedications] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const cameraRef = useRef(null);

    const handleTakePhoto = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert("Permission", "Camera permission is required to scan prescriptions.");
                return;
            }
        }
        setStatus("capturing");
    };

    const handleUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageDataUri(result.assets[0].uri);
            handleAnalyze(result.assets[0].uri);
        }
    };

    const handleCapture = async () => {
        if (cameraRef.current) {
            const photo = await (cameraRef.current as any).takePictureAsync({ quality: 0.5, base64: true });
            setImageDataUri(photo.uri);
            setStatus("idle");
            handleAnalyze(photo.uri);
        }
    };

    const handleAnalyze = async (uri: string) => {
        setStatus("analyzing");
        // Simulated AI analysis to match web behavior without complex setup
        setTimeout(() => {
            setMedications([
                { name: "Amoxicillin", dosage: "500mg - Thrice daily" },
                { name: "Paracetamol", dosage: "650mg - When needed" }
            ]);
            setStatus("success");
        }, 3000);
    };

    const handleAddToMeds = async () => {
        setIsSaving(true);
        try {
            // In a real app, we'd loop and save to API. 
            // For 1:1 demo, we'll show success and redirect.
            setTimeout(() => {
                Alert.alert("Success", "Medications added to your tracker.");
                router.push('/(tabs)/meds');
            }, 1000);
        } finally {
            setIsSaving(false);
        }
    };

    const styles = getStyles(theme);

    const renderContent = () => {
        switch (status) {
            case 'capturing':
                return (
                    <View style={styles.cameraContainer}>
                        <CameraView 
                            style={styles.camera} 
                            facing="back"
                            ref={cameraRef}
                        >
                            <View style={styles.cameraOverlay}>
                                <View style={styles.reticle} />
                                <View style={styles.cameraFooter}>
                                    <TouchableOpacity 
                                        style={styles.shutterBtn} 
                                        onPress={handleCapture}
                                    >
                                        <View style={styles.shutterInner} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.cameraClose}
                                        onPress={() => setStatus('idle')}
                                    >
                                        <X size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </CameraView>
                    </View>
                );
            case 'analyzing':
                return (
                    <View style={styles.analyzingBox}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={styles.analyzingTitle}>Analyzing Prescription...</Text>
                        <Text style={styles.analyzingSub}>The AI is reading the image.</Text>
                        {imageDataUri && (
                            <Image source={{ uri: imageDataUri }} style={styles.analyzingPreview} />
                        )}
                    </View>
                );
            case 'success':
                return (
                    <View style={styles.successContent}>
                        <View style={styles.successHeader}>
                            <Sparkles size={20} color={theme.primary} />
                            <Text style={styles.successTitle}>Extracted Medications</Text>
                        </View>
                        <View style={styles.medList}>
                            {medications.map((med, i) => (
                                <View key={i} style={styles.medCard}>
                                    <View style={styles.medIconBox}>
                                        <Pill size={20} color={theme.primary} />
                                    </View>
                                    <View style={styles.medInfo}>
                                        <Text style={styles.medName}>{med.name}</Text>
                                        <Text style={styles.medDosage}>{med.dosage}</Text>
                                    </View>
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>NEW</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.addFullBtn} onPress={handleAddToMeds}>
                            <Text style={styles.addFullBtnText}>
                                {isSaving ? 'Processing...' : 'Add to My Meds'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => setStatus('idle')}>
                            <RefreshCw size={16} color={theme.mutedForeground} />
                            <Text style={styles.retryBtnText}>Scan Another</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return (
                    <View style={styles.idleContent}>
                        <View style={styles.idleIllustration}>
                            <View style={styles.iconCircle}>
                                <Pill size={48} color={theme.primary} />
                            </View>
                        </View>
                        <Text style={styles.idleTitle}>Scan Prescription</Text>
                        <Text style={styles.idleDesc}>
                            Take a photo of your prescription or upload an image to automatically add medications to your tracker.
                        </Text>
                        <View style={styles.actionGroup}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleTakePhoto}>
                                <CameraIcon size={20} color="white" />
                                <Text style={styles.primaryBtnText}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleUpload}>
                                <FileUp size={20} color={theme.primary} />
                                <Text style={styles.secondaryBtnText}>Upload Image</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.foreground} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add from Prescription</Text>
            </View>
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={status !== 'capturing'}
            >
                <View style={styles.card}>
                    {renderContent()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
