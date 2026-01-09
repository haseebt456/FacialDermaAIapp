import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { authService } from '../../services/authService';
import { apiCheckUsername } from '../../services/api';

const { width } = Dimensions.get('window');

// Color palette
const COLORS = {
  background: '#f7fafb',
  border: '#00000014',
  primary: '#2b6cb0',
  secondary: '#d6f6f1',
  card: '#ffffff',
  text: '#1a202c',
  textSecondary: '#718096',
  textMuted: '#a0aec0',
  error: '#e53e3e',
  inputBg: '#f7fafc',
};

// Password validation helper
const validatePasswordRules = (password: string) => {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const isValid = Object.values(rules).every(rule => rule);
  const errors = [];
  
  if (!rules.minLength) errors.push('At least 8 characters');
  if (!rules.hasUppercase) errors.push('One uppercase letter');
  if (!rules.hasLowercase) errors.push('One lowercase letter');
  if (!rules.hasNumber) errors.push('One number');
  if (!rules.hasSpecial) errors.push('One special character');
  
  return { isValid, rules, errors };
};

// Specialization options
const specializationOptions = [
  'Medical Dermatology',
  'Surgical Dermatology',
  'Dermatopathology',
  'Pediatric Dermatology',
  'Cosmetic Dermatology',
  'Immunodermatology',
  'Other',
];

const FaceIcon = () => (
  <View style={styles.iconContainer}>
    <Svg width="50" height="50" viewBox="0 0 80 80" fill="none">
      <Path
        d="M20 12C20 10.8954 20.8954 10 22 10H30"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M50 10H58C59.1046 10 60 10.8954 60 12V20"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M60 60V68C60 69.1046 59.1046 70 58 70H50"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M30 70H22C20.8954 70 20 69.1046 20 68V60"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M30 35C30 36.6569 31.3431 38 33 38C34.6569 38 36 36.6569 36 35C36 33.3431 34.6569 32 33 32C31.3431 32 30 33.3431 30 35Z"
        fill="#FFFFFF"
      />
      <Path
        d="M44 35C44 36.6569 45.3431 38 47 38C48.6569 38 50 36.6569 50 35C50 33.3431 48.6569 32 47 32C45.3431 32 44 33.3431 44 35Z"
        fill="#FFFFFF"
      />
      <Path
        d="M32 48C32 48 36 52 40 52C44 52 48 48 48 48"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

export default function AuthScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'dermatologist'>('patient');
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [clinic, setClinic] = useState('');
  const [experience, setExperience] = useState('');
  const [errors, setErrors] = useState<any>({});

  // Username availability check
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    rules: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    },
  });

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Debounced username check
  useEffect(() => {
    if (activeTab === 'login' || !username.trim()) {
      setUsernameCheck({ checking: false, available: null, message: '' });
      return;
    }

    setUsernameCheck(prev => ({ ...prev, checking: true, message: '' }));
    const timer = setTimeout(async () => {
      try {
        const res = await apiCheckUsername(username.trim());
        const available = !!res.data?.available;
        setUsernameCheck({
          checking: false,
          available,
          message: available ? 'Username is available' : 'Username is already taken',
        });
      } catch (err) {
        setUsernameCheck({
          checking: false,
          available: null,
          message: 'Unable to check username',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, activeTab]);

  // Password validation on change
  useEffect(() => {
    const validation = validatePasswordRules(password);
    setPasswordValidation({
      isValid: validation.isValid,
      rules: validation.rules,
    });
  }, [password]);

  // Reset form when switching tabs
  useEffect(() => {
    setErrors({});
    setSignupStep(1);
    setEmail('');
    setPassword('');
    setUsername('');
    setName('');
    setConfirmPassword('');
    setLicenseNumber('');
    setSpecialization('');
    setCustomSpecialization('');
    setClinic('');
    setExperience('');
  }, [activeTab]);

  // Reset step when role changes
  useEffect(() => {
    setSignupStep(1);
  }, [userRole]);

  const switchTab = (tab: 'login' | 'signup') => {
    if (tab === activeTab) return;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    // Slide indicator
    Animated.spring(slideAnim, {
      toValue: tab === 'login' ? 0 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  };

  const validateLogin = () => {
    const newErrors: any = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: any = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.includes(" ")) {
      newErrors.username = "Username cannot contain spaces";
    } else if (usernameCheck.available === false) {
      newErrors.username = "Username is already taken";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const validation = validatePasswordRules(password);
      if (!validation.isValid) {
        newErrors.password = validation.errors.join(', ');
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (userRole === 'dermatologist') {
      if (!name.trim()) {
        newErrors.name = "Full name is required for dermatologists";
      }
      if (!licenseNumber.trim()) {
        newErrors.license = "License number is required for dermatologists";
      }
      if (!specialization.trim()) {
        newErrors.specialization = "Specialization is required";
      }
      if (specialization === 'Other' && !customSpecialization.trim()) {
        newErrors.customSpecialization = "Please specify your specialization";
      }
      if (!experience.trim()) {
        newErrors.experience = "Years of experience is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step validation for dermatologist signup
  const canProceedStep1 = Boolean(
    username.trim() && 
    name.trim() && 
    email.trim() && 
    usernameCheck.available !== false
  );

  const canProceedStep2 = Boolean(
    licenseNumber.trim() && 
    specialization.trim() && 
    experience.trim() &&
    (specialization !== 'Other' || customSpecialization.trim())
  );

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setLoading(true);
    const result = await authService.login({
      emailOrUsername: email.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      // The AppNavigator will automatically switch to Main stack
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    setLoading(true);
    
    // Determine final specialization value
    const finalSpecialization = specialization === 'Other' 
      ? customSpecialization.trim() 
      : specialization;

    const signupData: any = {
      username: username.trim(),
      email: email.trim(),
      password,
      role: userRole,
    };

    if (userRole === 'dermatologist') {
      signupData.name = name.trim();
      signupData.license = licenseNumber.trim();
      signupData.specialization = finalSpecialization;
      if (clinic.trim()) {
        signupData.clinic = clinic.trim();
      }
      signupData.experience = experience.trim();
    } else if (name.trim()) {
      // Optional name for patients
      signupData.name = name.trim();
    }

    const result = await authService.signup(signupData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Registration Successful",
        "Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("EmailVerificationOTP", { email: email.trim() })
          }
        ]
      );
    } else {
      Alert.alert("Signup Failed", result.error);
    }
  };

  // Multi-step navigation for dermatologist
  const handleDermStepForward = () => {
    if (signupStep === 1 && !canProceedStep1) {
      Alert.alert("Required Fields", "Please provide name, username, and email to continue.");
      return;
    }
    if (signupStep === 2 && !canProceedStep2) {
      Alert.alert("Required Fields", "License number, specialization, and experience are required.");
      return;
    }
    setErrors({});
    setSignupStep(prev => Math.min(3, prev + 1));
  };

  const handleDermStepBack = () => {
    setErrors({});
    setSignupStep(prev => Math.max(1, prev - 1));
  };

  const handleDermSubmit = () => {
    if (signupStep < 3) {
      handleDermStepForward();
    } else {
      handleSignup();
    }
  };

  const handleContinue = () => {
    if (activeTab === 'login') {
      handleLogin();
    } else if (userRole === 'dermatologist') {
      handleDermSubmit();
    } else {
      handleSignup();
    }
  };

  const tabIndicatorTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width - 60) / 2],
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <FaceIcon />
            <Text style={styles.appName}>FacialDerma AI</Text>
            <Text style={styles.headerSubtitle}>
              Secure, AI-powered dermatology for{'\n'}patients and skin experts.
            </Text>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Designed with dermatologists</Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <View style={styles.tabBackground}>
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    {
                      transform: [{ translateX: tabIndicatorTranslate }],
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.tab, styles.tabLeft]}
                onPress={() => switchTab('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Log in
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, styles.tabRight]}
                onPress={() => switchTab('signup')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Content with Fade Animation */}
            <Animated.View style={{ opacity: fadeAnim }}>
              {activeTab === 'login' ? (
                // Login Form
                <View>
                  <Text style={styles.welcomeTitle}>Welcome back</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Access your skin reports and ongoing treatments.
                  </Text>

                  {/* Email Input */}
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setErrors({ ...errors, email: '' });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text style={styles.inputIcon}>✉️</Text>
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  {/* Password Input */}
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.textMuted}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setErrors({ ...errors, password: '' });
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.inputIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  {/* Forgot Password */}
                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>

                  {/* Continue Button */}
                  <TouchableOpacity 
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={handleContinue}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Text>
                    {!loading && <Text style={styles.buttonArrow}>→</Text>}
                  </TouchableOpacity>

                  {/* Create Account Link */}
                  <Text style={styles.footerText}>
                    New to FacialDerma AI?{' '}
                    <Text style={styles.link} onPress={() => switchTab('signup')}>
                      Create an account
                    </Text>
                  </Text>
                </View>
              ) : (
                // Signup Form
                <View>
                  <Text style={styles.welcomeTitle}>Create account</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Join us and start your skincare journey today.
                  </Text>

                  {/* Role Selector */}
                  <Text style={styles.label}>I am a:</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[styles.roleButton, userRole === 'patient' && styles.roleButtonActive]}
                      onPress={() => setUserRole('patient')}
                    >
                      <Text style={[styles.roleButtonText, userRole === 'patient' && styles.roleButtonTextActive]}>
                        👤 Patient
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, userRole === 'dermatologist' && styles.roleButtonActive]}
                      onPress={() => setUserRole('dermatologist')}
                    >
                      <Text style={[styles.roleButtonText, userRole === 'dermatologist' && styles.roleButtonTextActive]}>
                        👨‍⚕️ Dermatologist
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dermatologist Multi-Step Flow */}
                  {userRole === 'dermatologist' ? (
                    <>
                      {/* Step Indicator */}
                      <View style={styles.stepIndicator}>
                        <Text style={styles.stepText}>Step {signupStep} of 3</Text>
                        <Text style={styles.stepSubtext}>Dermatologist registration</Text>
                      </View>

                      {/* Step 1: Basic Info */}
                      {signupStep === 1 && (
                        <>
                          {/* Full Name */}
                          <Text style={styles.label}>Full Name *</Text>
                          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <TextInput
                              style={styles.input}
                              placeholder="Dr. John Doe"
                              placeholderTextColor={COLORS.textMuted}
                              value={name}
                              onChangeText={(text) => {
                                setName(text);
                                setErrors({ ...errors, name: '' });
                              }}
                            />
                            <Text style={styles.inputIcon}>👤</Text>
                          </View>
                          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                          {/* Username */}
                          <Text style={styles.label}>Username *</Text>
                          <View style={[
                            styles.inputContainer, 
                            errors.username && styles.inputError,
                            usernameCheck.available === true && styles.inputSuccess,
                            usernameCheck.available === false && styles.inputError,
                          ]}>
                            <TextInput
                              style={styles.input}
                              placeholder="Choose a username"
                              placeholderTextColor={COLORS.textMuted}
                              value={username}
                              onChangeText={(text) => {
                                setUsername(text);
                                setErrors({ ...errors, username: '' });
                              }}
                              autoCapitalize="none"
                            />
                            {usernameCheck.checking ? (
                              <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                              <Text style={styles.inputIcon}>👤</Text>
                            )}
                          </View>
                          {username.trim() && (
                            <Text style={[
                              styles.helperText,
                              usernameCheck.available === true && styles.successText,
                              usernameCheck.available === false && styles.errorText,
                            ]}>
                              {usernameCheck.checking ? 'Checking...' : usernameCheck.message}
                            </Text>
                          )}
                          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                          {/* Email */}
                          <Text style={styles.label}>Email *</Text>
                          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <TextInput
                              style={styles.input}
                              placeholder="name@example.com"
                              placeholderTextColor={COLORS.textMuted}
                              value={email}
                              onChangeText={(text) => {
                                setEmail(text);
                                setErrors({ ...errors, email: '' });
                              }}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                            <Text style={styles.inputIcon}>✉️</Text>
                          </View>
                          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </>
                      )}

                      {/* Step 2: Professional Info */}
                      {signupStep === 2 && (
                        <>
                          {/* License Number */}
                          <Text style={styles.label}>Medical License Number *</Text>
                          <View style={[styles.inputContainer, errors.license && styles.inputError]}>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g., PMC-12345-KPK"
                              placeholderTextColor={COLORS.textMuted}
                              value={licenseNumber}
                              onChangeText={(text) => {
                                setLicenseNumber(text);
                                setErrors({ ...errors, license: '' });
                              }}
                              autoCapitalize="characters"
                            />
                            <Text style={styles.inputIcon}>📜</Text>
                          </View>
                          {errors.license && <Text style={styles.errorText}>{errors.license}</Text>}

                          {/* Specialization Dropdown */}
                          <Text style={styles.label}>Specialization *</Text>
                          <View style={styles.dropdownContainer}>
                            {specializationOptions.map((option) => (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  styles.dropdownOption,
                                  specialization === option && styles.dropdownOptionActive,
                                ]}
                                onPress={() => {
                                  setSpecialization(option);
                                  setErrors({ ...errors, specialization: '' });
                                }}
                              >
                                <Text style={[
                                  styles.dropdownOptionText,
                                  specialization === option && styles.dropdownOptionTextActive,
                                ]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.specialization && <Text style={styles.errorText}>{errors.specialization}</Text>}

                          {/* Custom Specialization */}
                          {specialization === 'Other' && (
                            <>
                              <Text style={styles.label}>Specify Specialization *</Text>
                              <View style={[styles.inputContainer, errors.customSpecialization && styles.inputError]}>
                                <TextInput
                                  style={styles.input}
                                  placeholder="Enter your specialization"
                                  placeholderTextColor={COLORS.textMuted}
                                  value={customSpecialization}
                                  onChangeText={(text) => {
                                    setCustomSpecialization(text);
                                    setErrors({ ...errors, customSpecialization: '' });
                                  }}
                                />
                                <Text style={styles.inputIcon}>🔬</Text>
                              </View>
                              {errors.customSpecialization && <Text style={styles.errorText}>{errors.customSpecialization}</Text>}
                            </>
                          )}

                          {/* Clinic (Optional) */}
                          <Text style={styles.label}>Clinic / Hospital (Optional)</Text>
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g., City Hospital"
                              placeholderTextColor={COLORS.textMuted}
                              value={clinic}
                              onChangeText={setClinic}
                            />
                            <Text style={styles.inputIcon}>🏥</Text>
                          </View>

                          {/* Years of Experience */}
                          <Text style={styles.label}>Years of Experience *</Text>
                          <View style={[styles.inputContainer, errors.experience && styles.inputError]}>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g., 5"
                              placeholderTextColor={COLORS.textMuted}
                              value={experience}
                              onChangeText={(text) => {
                                setExperience(text);
                                setErrors({ ...errors, experience: '' });
                              }}
                              keyboardType="numeric"
                            />
                            <Text style={styles.inputIcon}>📅</Text>
                          </View>
                          {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
                        </>
                      )}

                      {/* Step 3: Password */}
                      {signupStep === 3 && (
                        <>
                          {/* Password */}
                          <Text style={styles.label}>Password *</Text>
                          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                            <TextInput
                              style={styles.input}
                              placeholder="Create a password"
                              placeholderTextColor={COLORS.textMuted}
                              value={password}
                              onChangeText={(text) => {
                                setPassword(text);
                                setErrors({ ...errors, password: '' });
                              }}
                              secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                              <Text style={styles.inputIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                            </TouchableOpacity>
                          </View>
                          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                          {/* Password Requirements */}
                          <View style={styles.passwordRequirements}>
                            <View style={styles.passwordRule}>
                              <Text style={[styles.passwordRuleIcon, passwordValidation.rules.minLength && styles.passwordRuleIconValid]}>
                                {passwordValidation.rules.minLength ? '✓' : '○'}
                              </Text>
                              <Text style={[styles.passwordRuleText, passwordValidation.rules.minLength && styles.passwordRuleTextValid]}>
                                At least 8 characters
                              </Text>
                            </View>
                            <View style={styles.passwordRule}>
                              <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasUppercase && styles.passwordRuleIconValid]}>
                                {passwordValidation.rules.hasUppercase ? '✓' : '○'}
                              </Text>
                              <Text style={[styles.passwordRuleText, passwordValidation.rules.hasUppercase && styles.passwordRuleTextValid]}>
                                One uppercase letter
                              </Text>
                            </View>
                            <View style={styles.passwordRule}>
                              <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasLowercase && styles.passwordRuleIconValid]}>
                                {passwordValidation.rules.hasLowercase ? '✓' : '○'}
                              </Text>
                              <Text style={[styles.passwordRuleText, passwordValidation.rules.hasLowercase && styles.passwordRuleTextValid]}>
                                One lowercase letter
                              </Text>
                            </View>
                            <View style={styles.passwordRule}>
                              <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasNumber && styles.passwordRuleIconValid]}>
                                {passwordValidation.rules.hasNumber ? '✓' : '○'}
                              </Text>
                              <Text style={[styles.passwordRuleText, passwordValidation.rules.hasNumber && styles.passwordRuleTextValid]}>
                                One number
                              </Text>
                            </View>
                            <View style={styles.passwordRule}>
                              <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasSpecial && styles.passwordRuleIconValid]}>
                                {passwordValidation.rules.hasSpecial ? '✓' : '○'}
                              </Text>
                              <Text style={[styles.passwordRuleText, passwordValidation.rules.hasSpecial && styles.passwordRuleTextValid]}>
                                One special character
                              </Text>
                            </View>
                          </View>

                          {/* Confirm Password */}
                          <Text style={styles.label}>Confirm Password *</Text>
                          <View style={[
                            styles.inputContainer, 
                            errors.confirmPassword && styles.inputError,
                            confirmPassword && password === confirmPassword && styles.inputSuccess,
                            confirmPassword && password !== confirmPassword && styles.inputError,
                          ]}>
                            <TextInput
                              style={styles.input}
                              placeholder="Confirm your password"
                              placeholderTextColor={COLORS.textMuted}
                              value={confirmPassword}
                              onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors({ ...errors, confirmPassword: '' });
                              }}
                              secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <Text style={styles.inputIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
                            </TouchableOpacity>
                          </View>
                          {confirmPassword && password !== confirmPassword && (
                            <Text style={styles.errorText}>Passwords do not match</Text>
                          )}
                          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </>
                      )}

                      {/* Step Navigation Buttons */}
                      <View style={styles.stepButtons}>
                        {signupStep > 1 && (
                          <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleDermStepBack}
                          >
                            <Text style={styles.backButtonText}>← Back</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[
                            styles.primaryButton,
                            styles.stepButton,
                            loading && styles.primaryButtonDisabled,
                            signupStep === 1 && !canProceedStep1 && styles.primaryButtonDisabled,
                            signupStep === 2 && !canProceedStep2 && styles.primaryButtonDisabled,
                          ]}
                          onPress={handleContinue}
                          disabled={loading || (signupStep === 1 && !canProceedStep1) || (signupStep === 2 && !canProceedStep2)}
                        >
                          <Text style={styles.primaryButtonText}>
                            {loading ? 'Creating...' : signupStep < 3 ? 'Next' : 'Create account'}
                          </Text>
                          {!loading && <Text style={styles.buttonArrow}>→</Text>}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    /* Patient Single-Step Flow */
                    <>
                      {/* Username */}
                      <Text style={styles.label}>Username *</Text>
                      <View style={[
                        styles.inputContainer, 
                        errors.username && styles.inputError,
                        usernameCheck.available === true && styles.inputSuccess,
                        usernameCheck.available === false && styles.inputError,
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Choose a username"
                          placeholderTextColor={COLORS.textMuted}
                          value={username}
                          onChangeText={(text) => {
                            setUsername(text);
                            setErrors({ ...errors, username: '' });
                          }}
                          autoCapitalize="none"
                        />
                        {usernameCheck.checking ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <Text style={styles.inputIcon}>👤</Text>
                        )}
                      </View>
                      {username.trim() && (
                        <Text style={[
                          styles.helperText,
                          usernameCheck.available === true && styles.successText,
                          usernameCheck.available === false && styles.errorText,
                        ]}>
                          {usernameCheck.checking ? 'Checking...' : usernameCheck.message}
                        </Text>
                      )}
                      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                      {/* Full Name (Optional for patients) */}
                      <Text style={styles.label}>Full Name (Optional)</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="Your name"
                          placeholderTextColor={COLORS.textMuted}
                          value={name}
                          onChangeText={setName}
                        />
                        <Text style={styles.inputIcon}>👤</Text>
                      </View>

                      {/* Email */}
                      <Text style={styles.label}>Email *</Text>
                      <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                        <TextInput
                          style={styles.input}
                          placeholder="name@example.com"
                          placeholderTextColor={COLORS.textMuted}
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            setErrors({ ...errors, email: '' });
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        <Text style={styles.inputIcon}>✉️</Text>
                      </View>
                      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                      {/* Password */}
                      <Text style={styles.label}>Password *</Text>
                      <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Create a password"
                          placeholderTextColor={COLORS.textMuted}
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            setErrors({ ...errors, password: '' });
                          }}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Text style={styles.inputIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                        </TouchableOpacity>
                      </View>
                      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                      {/* Password Requirements for Patient */}
                      <View style={styles.passwordRequirements}>
                        <View style={styles.passwordRule}>
                          <Text style={[styles.passwordRuleIcon, passwordValidation.rules.minLength && styles.passwordRuleIconValid]}>
                            {passwordValidation.rules.minLength ? '✓' : '○'}
                          </Text>
                          <Text style={[styles.passwordRuleText, passwordValidation.rules.minLength && styles.passwordRuleTextValid]}>
                            At least 8 characters
                          </Text>
                        </View>
                        <View style={styles.passwordRule}>
                          <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasUppercase && styles.passwordRuleIconValid]}>
                            {passwordValidation.rules.hasUppercase ? '✓' : '○'}
                          </Text>
                          <Text style={[styles.passwordRuleText, passwordValidation.rules.hasUppercase && styles.passwordRuleTextValid]}>
                            One uppercase letter
                          </Text>
                        </View>
                        <View style={styles.passwordRule}>
                          <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasLowercase && styles.passwordRuleIconValid]}>
                            {passwordValidation.rules.hasLowercase ? '✓' : '○'}
                          </Text>
                          <Text style={[styles.passwordRuleText, passwordValidation.rules.hasLowercase && styles.passwordRuleTextValid]}>
                            One lowercase letter
                          </Text>
                        </View>
                        <View style={styles.passwordRule}>
                          <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasNumber && styles.passwordRuleIconValid]}>
                            {passwordValidation.rules.hasNumber ? '✓' : '○'}
                          </Text>
                          <Text style={[styles.passwordRuleText, passwordValidation.rules.hasNumber && styles.passwordRuleTextValid]}>
                            One number
                          </Text>
                        </View>
                        <View style={styles.passwordRule}>
                          <Text style={[styles.passwordRuleIcon, passwordValidation.rules.hasSpecial && styles.passwordRuleIconValid]}>
                            {passwordValidation.rules.hasSpecial ? '✓' : '○'}
                          </Text>
                          <Text style={[styles.passwordRuleText, passwordValidation.rules.hasSpecial && styles.passwordRuleTextValid]}>
                            One special character
                          </Text>
                        </View>
                      </View>

                      {/* Confirm Password */}
                      <Text style={styles.label}>Confirm Password *</Text>
                      <View style={[
                        styles.inputContainer, 
                        errors.confirmPassword && styles.inputError,
                        confirmPassword && password === confirmPassword && styles.inputSuccess,
                        confirmPassword && password !== confirmPassword && styles.inputError,
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm your password"
                          placeholderTextColor={COLORS.textMuted}
                          value={confirmPassword}
                          onChangeText={(text) => {
                            setConfirmPassword(text);
                            setErrors({ ...errors, confirmPassword: '' });
                          }}
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Text style={styles.inputIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
                        </TouchableOpacity>
                      </View>
                      {confirmPassword && password !== confirmPassword && (
                        <Text style={styles.errorText}>Passwords do not match</Text>
                      )}
                      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                      {/* Create Account Button */}
                      <TouchableOpacity 
                        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                        onPress={handleContinue}
                        disabled={loading || usernameCheck.available === false}
                      >
                        <Text style={styles.primaryButtonText}>
                          {loading ? 'Creating account...' : 'Create account'}
                        </Text>
                        {!loading && <Text style={styles.buttonArrow}>→</Text>}
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Login Link */}
                  <Text style={styles.footerText}>
                    Already have an account?{' '}
                    <Text style={styles.link} onPress={() => switchTab('login')}>
                      Log in
                    </Text>
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.card,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48bb78',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 13,
    color: COLORS.card,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: 500,
  },
  tabContainer: {
    position: 'relative',
    height: 48,
    marginBottom: 32,
  },
  tabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 24,
  },
  tabIndicator: {
    position: 'absolute',
    width: (width - 48) / 2,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    position: 'absolute',
    width: (width - 48) / 2,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLeft: {
    left: 0,
  },
  tabRight: {
    right: 0,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.card,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  inputIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    height: 48,
    width: '50%',

    marginTop: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.card,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 16,
    color: COLORS.card,
    marginLeft: 4,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  socialIconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  socialButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  roleButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputSuccess: {
    borderColor: '#48bb78',
  },
  successText: {
    color: '#48bb78',
  },
  stepIndicator: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stepButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  stepButton: {
    flex: 1,
    width: 'auto',
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'auto',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
  },
  dropdownOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
  },
  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  passwordRuleIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
  passwordRuleIconValid: {
    color: '#48bb78',
  },
  passwordRuleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  passwordRuleTextValid: {
    color: '#48bb78',
  },
});
