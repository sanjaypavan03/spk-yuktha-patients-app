import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckSquare, Square, Lock } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.isDarkMode ? '#020617' : '#0F2027',
  },
  keyboardView: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  brandContainer: {
    height: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  brandItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  brandInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 48,
    color: '#02B69A',
    lineHeight: 60,
  },
  brandDot: {
    width: 8,
    height: 8,
    backgroundColor: '#00D4AA',
    borderRadius: 4,
    marginLeft: 4,
    marginBottom: 10,
  },
  tagline: {
    marginTop: 0,
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  rotatingTextContainer: {
    marginTop: 0,
    height: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  rotatingText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins_400Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomSheet: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: Platform.OS === 'web' ? 400 : '100%',
    alignSelf: 'center',
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 9999,
    alignSelf: 'center',
    marginBottom: 32,
  },

  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.foreground,
    marginBottom: 24,
    fontFamily: 'PlayfairDisplay_900Black_Italic',
  },
  errorBox: {
    padding: 12,
    backgroundColor: theme.isDarkMode ? '#450a0a' : '#FEF2F2',
    borderWidth: 1,
    borderColor: theme.isDarkMode ? '#7f1d1d' : '#FECACA',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    color: theme.mutedForeground,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.isDarkMode ? '#1E293B' : '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? '#334155' : '#E2E8F0',
    color: theme.isDarkMode ? '#F8FAFC' : '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  buttonShadow: {
    marginTop: 24,
    shadowColor: '#02B69A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  toggleContainer: {
    marginTop: 28,
    paddingBottom: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#02B69A',
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginLeft: 4,
  },
  checkboxText: {
    fontSize: 13,
    color: theme.mutedForeground,
    marginLeft: 10,
    fontFamily: 'Poppins_400Regular',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    opacity: 0.5,
  },
  securityNoteText: {
    fontSize: 11,
    color: theme.mutedForeground,
    fontFamily: 'Poppins_500Medium',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
    opacity: 0.3,
  },
  separatorBox: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 12,
  },
  separatorText: {
    fontSize: 10,
    color: theme.mutedForeground,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 4,
  },
  socialIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  socialIconText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  }
});

function MultilingualBrand({ theme }: any) {
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);
  const brandTransliterations = [
    "yuktha", "युक्ता", "యుక్త", "யுக்தா", "ಯುಕ್ತ", "യുക്ത", "যুক্তা", "युक्ता",
    "યુક્તા", "ਯੁਕਤਾ", "ଯୁକ୍ତା", "یکتہ", "যুক্তা", "युक्ता", "युक्ता", "युक्ता",
    "يُڪتا", "युक्ता", "یُکتا", "ꯌꯨꯛꯇꯥ", "युक्ता", "ᱭᱩᱠᱛᱟ", "युक्ता"
  ];
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 16, duration: 700, useNativeDriver: Platform.OS !== 'web' })
      ]).start(() => {
        setActiveBrandIndex(prev => (prev + 1) % brandTransliterations.length);
        slideAnim.setValue(-16);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const styles = getStyles(theme);

  return (
    <View style={styles.brandContainer}>
      <Animated.View 
        style={[
          styles.brandItem,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.brandInner}>
          <Text 
            style={[
              styles.brandText, 
              { 
                fontWeight: '900',
                fontStyle: 'italic'
              },
              activeBrandIndex === 0 ? { 
                fontFamily: 'PlayfairDisplay_900Black_Italic', 
                letterSpacing: -1.2,
              } : {
                // Fallback serif for Indic to maintain the "Playfair" look
                fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia',
                fontSize: 38,
                letterSpacing: -0.5
              }
            ]}
            allowFontScaling={false}
          >
            {brandTransliterations[activeBrandIndex]}
          </Text>
          <View style={styles.brandDot} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isLoading, user } = useAuth();
  const { isDarkMode, theme } = useTheme();
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const rotatingTexts = [
    "Health connected.",
    "Care protected.",
    "Your medical identity.",
    "Always with you.",
    "Emergency ready.",
    "No more lost records.",
    "Seamless care, everywhere.",
    "One scan away."
  ];
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const textSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(textFadeAnim, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(textSlideAnim, { toValue: 16, duration: 700, useNativeDriver: Platform.OS !== 'web' })
      ]).start(() => {
        setActiveTextIndex(prev => (prev + 1) % rotatingTexts.length);
        textSlideAnim.setValue(-16);
        Animated.parallel([
          Animated.timing(textFadeAnim, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(textSlideAnim, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password || (!isLoginView && !fullName)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isLoginView && !acceptedTerms) {
      setError("Please agree to the Terms & Privacy Policy.");
      return;
    }
    try {
      if (isLoginView) {
        const result = await login(email, password);
        if (result.success) {
          router.replace('/(tabs)/dashboard');
        } else {
           setError(result.error || "Invalid email or password.");
        }
      } else {
        const result = await signup(fullName, email, password, '+91' + phone);
        if (result.success) {
          router.replace('/(tabs)/dashboard');
        } else {
          setError(result.error || "Registration failed.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <MultilingualBrand theme={theme} />
            <Text style={styles.tagline}>Always with you.</Text>
            <View style={styles.rotatingTextContainer}>
              <Animated.Text style={[styles.rotatingText, { opacity: textFadeAnim, transform: [{ translateY: textSlideAnim }] }]}>
                {rotatingTexts[activeTextIndex]}
              </Animated.Text>
            </View>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            
            <Text style={styles.titleText}>
              {isLoginView ? 'Welcome back' : 'Create account'}
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!isLoginView && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={theme.mutedForeground}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            {!isLoginView && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
                  <Text style={{ color: theme.foreground, fontWeight: 'bold', marginRight: 8, fontSize: 16 }}>+91</Text>
                  <TextInput
                    style={{ flex: 1, color: theme.foreground, fontSize: 16, fontWeight: '600', height: '100%' }}
                    placeholder="9876543210"
                    placeholderTextColor={theme.mutedForeground}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={theme.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLoginView && (
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.7}
              >
                {acceptedTerms ? (
                  <CheckSquare size={20} color={'#02B69A'} />
                ) : (
                  <Square size={20} color={theme.mutedForeground} />
                )}
                <Text style={styles.checkboxText}>I agree to Terms & Privacy Policy</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={isLoading}
              onPress={handleSubmit}
              style={styles.buttonShadow}
            >
              <LinearGradient
                colors={['#02B69A', '#018A75']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Please wait...' : (isLoginView ? 'Sign Into Yuktha' : 'Create My Account')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isLoginView && (
              <>
                <View style={styles.securityNote}>
                  <Lock size={12} color={theme.mutedForeground} style={{ marginRight: 4 }} />
                  <Text style={styles.securityNoteText}>Your data is encrypted and secure</Text>
                </View>

                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <View style={styles.separatorBox}>
                    <Text style={styles.separatorText}>OR</Text>
                  </View>
                  <View style={styles.separatorLine} />
                </View>

                <View style={styles.socialRow}>
                  <TouchableOpacity style={[styles.socialIconCircle, { borderColor: '#EA4335' }]} activeOpacity={0.7}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.34-4.53z" fill="#EA4335"/>
                    </Svg>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.socialIconCircle, { borderColor: theme.foreground }]} activeOpacity={0.7}>
                    <Svg width="22" height="22" viewBox="0 0 384 512" fill={theme.foreground}>
                      <Path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-39-19.9-64.7-45.9-67.7-92zM281.4 67.9c15.7-19.4 26.2-46.7 23.3-73.9-23.3 1.2-51.4 16.3-68.1 35.8-14.8 17.4-27.8 45.7-24.8 72.1 25.8 2 52.1-14.6 69.6-34z"/>
                    </Svg>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.toggleContainer}>
              <TouchableOpacity onPress={() => { setIsLoginView(!isLoginView); setError(null); }}>
                <Text style={styles.toggleText}>
                  {isLoginView ? 
                    "Don't have an account? Create one" : 
                    <Text>
                      <Text style={{ color: theme.mutedForeground }}>Already a user? </Text>
                      <Text style={{ color: theme.foreground, textDecorationLine: 'underline', fontWeight: 'bold' }}>LOGIN</Text>
                    </Text>
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


