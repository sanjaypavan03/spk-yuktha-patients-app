import React, { useState, useRef } from 'react';
import { Tabs } from 'expo-router';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  Dimensions, 
  Animated,
  Pressable,
  Platform
} from 'react-native';
import { 
  Home,
  Plus,
  Pill,
  Calendar,
  FileText,
  QrCode,
  TestTube2,
  MessageSquare,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

const TabItem = ({ route, index, options, isFocused, onPress, Icon, theme, styles }) => {
  const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(labelAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const translateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  const opacity = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
    >
        <View style={styles.iconContainer}>
            <Icon 
              size={24} 
              color={isFocused ? '#10B981' : '#94A3B8'} 
              strokeWidth={isFocused ? 2.5 : 2}
            />
        </View>
        <Animated.Text 
          style={[
            styles.tabLabel, 
            { 
              color: isFocused ? '#10B981' : '#94A3B8',
              opacity: opacity,
              transform: [{ translateY }]
            }
          ]}
        >
          {options.title}
        </Animated.Text>
    </TouchableOpacity>
  );
};

function CustomTabBar({ state, descriptors, navigation }) {
  const [isDialOpen, setIsDialOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, theme } = useTheme();
  
  const styles = getStyles(theme);

  const toggleDial = () => {
    const toValue = isDialOpen ? 0 : 1;
    setIsDialOpen(!isDialOpen);
    Animated.spring(animation, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeDial = (href?: string) => {
    setIsDialOpen(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
        if (href) router.push(href);
    });
  };

  const speedDialActions = [
    { label: 'Add Medicine', icon: Pill, color: isDarkMode ? '#064E3B' : '#ECFDF5', iconColor: theme.primary, href: '/(tabs)/add-prescription' },
    { label: 'Appointments', icon: Calendar, color: isDarkMode ? '#1E3A8A' : '#EFF6FF', iconColor: '#3B82F6', href: '/(tabs)/appointments' },
    { label: 'Analyse Report', icon: FileText, color: isDarkMode ? '#312E81' : '#EEF2FF', iconColor: '#6366F1', href: '/(tabs)/reports' },
    { label: 'Notes', icon: MessageSquare, color: isDarkMode ? '#4C1D95' : '#F5F3FF', iconColor: '#8B5CF6', href: '/(tabs)/notes' },
    { label: 'Lab Tests', icon: TestTube2, color: isDarkMode ? '#083344' : '#ECFEFF', iconColor: '#06B6D4', href: '/(tabs)/tests' },
    { label: 'Emergency Hub', icon: QrCode, color: isDarkMode ? '#450a0a' : '#FFF1F2', iconColor: theme.danger, href: '/(tabs)/emergency' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isDialOpen && (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => closeDial()}
        >
          <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
        </Pressable>
      )}

      {/* Speed Dial Menu */}
      <View style={styles.dialContainer} pointerEvents={isDialOpen ? 'auto' : 'none'}>
        {speedDialActions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          });
          const opacity = animation.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 0, 1],
          });
          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.1],
          });

          return (
            <Animated.View 
              key={index} 
              style={[
                styles.actionItem, 
                { 
                  transform: [{ translateY }, { scale }],
                  opacity,
                  marginBottom: 10
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => closeDial(action.href)}
              >
                <Text style={styles.actionLabel}>{action.label}</Text>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={18} color={action.iconColor} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.tabBarContainer}>
        <BlurView intensity={95} tint={isDarkMode ? 'dark' : 'light'} style={styles.tabBarBlur}>
            <View style={styles.tabContent}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const allowedRoutes = ['dashboard', 'meds', 'add', 'reports', 'profile'];
                if (!allowedRoutes.includes(route.name) || options.href === null) return null;
                
                const isFocused = state.index === index;

                const onPress = () => {
                   if (index === 2) return;
                   closeDial();
                   const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };
 
                const icons = {
                dashboard: Home,
                meds: Pill,
                add: Plus,
                reports: FileText,
                profile: User,
                };
                const Icon = icons[route.name] || Home;

                if (index === 2) {
                    return (
                        <View key="fab-placeholder" style={styles.fabWrapper}>
                            <TouchableOpacity
                                onPress={toggleDial}
                                activeOpacity={0.9}
                                style={styles.fabButton}
                            >
                                <LinearGradient
                                colors={isDarkMode ? ['#10B981', '#059669'] : ['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.fabGradient}
                                >
                                <Animated.View style={{ 
                                    transform: [{ 
                                    rotate: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '45deg']
                                    }) 
                                    }] 
                                }}>
                                    <Plus size={32} color="white" strokeWidth={3} />
                                </Animated.View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    );
                }

                return (
                  <TabItem 
                    key={route.key} 
                    route={route} 
                    index={index} 
                    options={options} 
                    isFocused={isFocused} 
                    onPress={onPress} 
                    Icon={Icon}
                    theme={theme}
                    styles={styles}
                  />
                );
            })}
            </View>
        </BlurView>
      </View>
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="meds"
        options={{ title: 'Meds' }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add' }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Reports' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
      <Tabs.Screen
        name="vault"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="add-prescription"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="appointments"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="emergency"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="family"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="health-repository"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="lifestyle"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notes"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="tests"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarBlur: {
    flex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5 - 10,
    height: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  fabWrapper: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  fabButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  fabGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  dialContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  actionItem: {
    width: 180,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.foreground,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
