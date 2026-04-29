import React, { useState, useEffect, useRef } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { Lock, Shield, X, AlertCircle, Check } from "lucide-react-native";
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SecretVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const languages = [
    "সুৰক্ষিত", "নিরাপদ", "रैखाঠি", "सुरक्षित", "સુરક્ષિત", "सुरक्षित", 
    "ಕರ್ನಾಟಕ", "محفوظ", "सुरक्षित", "सुरक्षित", "സുരക്ഷിത", "ঙাক-শেনবা", 
    "सुरक्षित", "सुरक्षित", "ସୁରକ୍ଷିତ", "ਸੁਰੱਖਿਅਤ", "సురక్షిత", "ᱥᱩᱨᱚᱠᱷᱤᱛ", 
    "محفوظ", "பாதுகாப்பான", "సురక్షిత", "محفوظ"
];

export function SecretVaultModal({ isOpen, onClose, onSuccess }: SecretVaultModalProps) {
    const { token, API_URL } = useAuth();
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [langIndex, setLangIndex] = useState(0);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setError(false);
            setIsVerifying(false);
            const interval = setInterval(() => {
                setLangIndex((prev) => (prev + 1) % languages.length);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const verifyPin = async (finalPin: string) => {
        setIsVerifying(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/vault-pin/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pin: finalPin })
            });
            const data = await res.json();
            if (data.success) {
                onSuccess();
            } else {
                handleError();
            }
        } catch (err) {
            console.error('PIN verification error:', err);
            handleError();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleNumberClick = (num: string) => {
        if (isVerifying) return;
        setError(false);
        const index = pin.findIndex(p => p === '');
        if (index === -1) return;

        const newPin = [...pin];
        newPin[index] = num;
        setPin(newPin);

        if (index === 3) {
            const finalPin = newPin.join('');
            verifyPin(finalPin);
        }
    };

    const handleManualSubmit = () => {
        if (isVerifying) return;
        const finalPin = pin.join('');
        if (finalPin.length === 4 && !pin.includes('')) {
            verifyPin(finalPin);
        } else {
            handleError();
        }
    };

    const handleClear = () => {
        if (isVerifying) return;
        setPin(['', '', '', '']);
        setError(false);
    };

    const handleError = () => {
        setError(true);
        triggerShake();
        setTimeout(() => {
            setPin(['', '', '', '']);
        }, 500);
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity 
                    style={styles.backdrop} 
                    activeOpacity={1} 
                    onPress={onClose} 
                />
                
                <Animated.View style={[
                    styles.modalContainer,
                    { transform: [{ translateX: shakeAnimation }] }
                ]}>
                    <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={onClose}
                    >
                        <X size={16} color="#64748B" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.lockBadge}>
                            <Lock size={24} color="#10B981" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.title}>
                            Your reports are <Text style={styles.langText}>{languages[langIndex]}</Text>
                        </Text>
                        <Text style={styles.subtitle}>Verify your PIN to continue</Text>
                    </View>

                    {/* PIN Display */}
                    <View style={styles.pinRow}>
                        {pin.map((digit, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.pinDot,
                                    digit !== '' && styles.pinDotFilled,
                                    error && styles.pinDotError
                                ]}
                            />
                        ))}
                    </View>

                    {/* Keypad */}
                    <View style={styles.keypad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.key}
                                onPress={() => handleNumberClick(num.toString())}
                            >
                                <Text style={styles.keyText}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.key} onPress={handleClear}>
                            <Text style={styles.keyActionText}>CLR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.key} 
                            onPress={() => handleNumberClick('0')}
                        >
                            <Text style={styles.keyText}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.key, styles.keyCheck]} 
                            onPress={handleManualSubmit}
                        >
                            <Check size={20} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <AlertCircle size={12} color="#EF4444" />
                            <Text style={styles.errorText}>Invalid authentication PIN</Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <View style={styles.shieldRow}>
                            <Shield size={10} color="#10B981BB" />
                            <Shield size={10} color="#10B981BB" />
                            <Shield size={10} color="#10B981BB" />
                        </View>
                        <Text style={styles.footerText}>END-TO-END ENCRYPTED</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: Math.min(SCREEN_WIDTH * 0.85, 320),
        backgroundColor: '#0F172ACC',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        right: 16,
        top: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    lockBadge: {
        width: 44,
        height: 44,
        borderRadius: 18,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    },
    langText: {
        color: '#10B981',
    },
    subtitle: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '500',
    },
    pinRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    pinDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    pinDotFilled: {
        backgroundColor: '#10B981',
        borderColor: '#10B98144',
    },
    pinDotError: {
        backgroundColor: '#EF4444',
        borderColor: '#EF444444',
    },
    keypad: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    key: {
        width: '28%',
        aspectRatio: 1.8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    keyCheck: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    keyText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    keyActionText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '900',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 11,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    shieldRow: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 4,
    },
    footerText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#64748B',
        letterSpacing: 2,
    },
});
