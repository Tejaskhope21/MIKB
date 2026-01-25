import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

/* =========================
   API BASE URL (FIXED)
========================= */
const API_URL = Platform.OS === 'web' 
  ? 'https://bricks-backend-qyea.onrender.com/api' 
  : 'http://10.0.2.2:5000/api';

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // Check backend connection on mount
  React.useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(API_URL.replace('/api', '') + '/health');
      if (response.ok) {
        setBackendStatus('✅ Connected');
      } else {
        setBackendStatus('❌ Failed');
      }
    } catch (err) {
      setBackendStatus('❌ Offline');
    }
  };

  /* =========================
     ORIGINAL LOGIN HANDLER - NO CHANGES
  ========================= */
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint = '';

      if (role === 'user') {
        endpoint = `${API_URL}/auth/user/login`;
      } else if (role === 'seller') {
        endpoint = `${API_URL}/auth/seller/login`;
      } else if (role === 'contractor') {
        endpoint = `${API_URL}/contractor/auth/login`;
      }

      console.log('[LOGIN API]', endpoint);

      const response = await axios.post(endpoint, {
        email,
        password,
      });

      const token = response.data.token;
      const userData =
        response.data.user ||
        response.data.seller ||
        response.data.contractor;

      if (!token || !userData) {
        throw new Error('Invalid server response');
      }

      await AsyncStorage.multiSet([
        ['token', token],
        ['userRole', role],
        ['userData', JSON.stringify(userData)],
        ['isLoggedIn', 'true'],
      ]);

      Alert.alert('Success', 'Login successful');

      if (role === 'seller') {
        router.replace('/(tabs)/seller-dashboard');
      } else if (role === 'contractor') {
        router.replace('/(tabs)/contractor-dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('[LOGIN ERROR]', err?.response || err);

      setError(
        err?.response?.data?.message ||
        'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Test backend connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL.replace('/api', '') + '/health');
      if (response.ok) {
        Alert.alert('✅ Backend Connected', `Connected to: ${API_URL}`);
      } else {
        Alert.alert('⚠️ Backend Error', `Status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('❌ Connection Failed', `Cannot connect to ${API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up navigation
  const handleSignUp = () => {
    router.push('/register');
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Please contact your administrator to reset your password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Simple Header - Match the image */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Role Selection - Simple tabs like in image */}
          <View style={styles.tabsContainer}>
            {['user', 'seller', 'contractor'].map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.tab,
                  role === r && styles.activeTab
                ]}
                onPress={() => setRole(r)}
                disabled={loading}
              >
                <Text style={[
                  styles.tabText,
                  role === r && styles.activeTabText
                ]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, loading && styles.disabledInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link - Like in image */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign up now</Text>
              </TouchableOpacity>
            </View>

            
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 BricksIT. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES MATCHING THE IMAGE
========================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#800000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#800000',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#800000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  signUpText: {
    fontSize: 15,
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: 15,
    color: '#800000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  testButton: {
    backgroundColor: '#4b5563',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});