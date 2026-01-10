// app/(auth)/login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Your API URL
const API_URL = 'http://10.0.2.2:5000/api';

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
  };

  const handleLogin = async () => {
    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint;
      if (activeTab === 'user') {
        endpoint = `${API_URL}/auth/user/login`;
      } else if (activeTab === 'seller') {
        endpoint = `${API_URL}/auth/seller/login`;
      } else if (activeTab === 'contractor') {
        endpoint = `${API_URL}/contractor/auth/login`;
      }

      console.log('Attempting login to:', endpoint);

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.user || response.data.seller || response.data.contractor;

        let userRole = activeTab;

        if (response.data.contractor) {
          userRole = 'contractor';
        } else if (response.data.seller) {
          userRole = 'seller';
        } else if (response.data.user) {
          userRole = 'user';
        }

        // Save to AsyncStorage instead of localStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userRole', userRole);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('isLoggedIn', 'true');

        console.log('Login successful. Role:', userRole);

        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                switch (userRole) {
                  case 'seller':
                    router.replace('/(tabs)/seller-dashboard');
                    break;
                  case 'contractor':
                    router.replace('/(tabs)/contractor-dashboard');
                    break;
                  default:
                    router.replace('/(tabs)');
                }
              }, 500);
            },
          },
        ]);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err.response || err);
      let errorMsg = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg = 'Login endpoint not found.';
        } else if (err.response.status === 401) {
          errorMsg = 'Invalid email or password';
        } else {
          errorMsg = err.response.data?.message || `Login failed (${err.response.status})`;
        }
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.push('/(auth)/Register');
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'user':
        return 'person';
      case 'seller':
        return 'storefront';
      case 'contractor':
        return 'construct';
      default:
        return 'person';
    }
  };

  const getTabLabel = (tab) => {
    return tab.charAt(0).toUpperCase() + tab.slice(1);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="cube" size={48} color="#800000" />
              <Text style={styles.logoText}>BricksIT</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Role Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsInner}>
              {['user', 'seller', 'contractor'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.tab,
                    activeTab === role && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange(role)}
                  disabled={loading}
                >
                  <Icon
                    name={getTabIcon(role)}
                    size={18}
                    color={activeTab === role ? '#fff' : '#800000'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === role && styles.activeTabText,
                    ]}
                  >
                    {getTabLabel(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorContent}>
                <Icon name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          ) : null}

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="mail" size={20} color="#4b5563" />
                <Text style={styles.labelText}>Email Address</Text>
              </View>
              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Icon name="lock-closed" size={20} color="#4b5563" />
                <Text style={styles.labelText}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, loading && styles.disabledInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
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

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
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
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.loginButtonContent}>
                  <Icon name="log-in" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>
                    Sign in as {getTabLabel(activeTab)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister} disabled={loading}>
                <Text style={styles.registerLink}>Sign up now</Text>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#800000',
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  tabsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tabsInner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#800000',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#800000',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  activeTabText: {
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    top: 16,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#800000',
    fontSize: 15,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#800000',
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 24,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  registerText: {
    fontSize: 15,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 15,
    color: '#800000',
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});