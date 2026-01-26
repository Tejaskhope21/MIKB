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

const API_URL = 'https://bricks-backend-qyea.onrender.com/api';

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

      console.log('Login endpoint:', endpoint);

      const response = await axios.post(endpoint, {
        email,
        password,
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response:', response.data);

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
        ['loginTime', new Date().toISOString()],
      ]);

      console.log('User data saved to AsyncStorage:', { role, token: token ? 'present' : 'missing' });

      Alert.alert('Success', 'Login successful');

      // Redirect based on role
      if (role === 'seller') {
        router.replace('/(seller)/dashboard');
      } else if (role === 'contractor') {
        // Updated route to contractor portfolio
        router.replace('/portfolio/');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
        }
      });
      
      let errorMessage = 'Unable to login. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        
        // Handle specific error cases
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid login data. Please check your credentials.';
        } else if (err.response.status === 404) {
          errorMessage = 'Account not found. Please check your email.';
        } else if (err.response.status === 403) {
          if (role === 'contractor') {
            errorMessage = 'Contractor account is pending approval';
          } else if (role === 'seller') {
            errorMessage = 'Seller account is pending approval';
          } else {
            errorMessage = 'Account not approved yet';
          }
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Server might be busy.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Check your internet connection.';
      } else if (err.message === 'Invalid server response') {
        errorMessage = 'Invalid server response. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/Register');
  };

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
          {/* Header with #800000 background */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Icon name="cube" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Sign in to your account</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Role Selection Tabs */}
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
                  <Icon 
                    name={
                      r === 'user' ? 'person' : 
                      r === 'seller' ? 'storefront' : 'construct'
                    } 
                    size={18} 
                    color={role === r ? '#fff' : '#666'} 
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.tabText,
                    role === r && styles.activeTabText
                  ]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Icon name="mail" size={16} color="#666" style={{marginRight: 6}} />
                Email Address
              </Text>
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
              <Text style={styles.label}>
                <Icon name="lock-closed" size={16} color="#666" style={{marginRight: 6}} />
                Password
              </Text>
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

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign up now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 BricksIT. All rights reserved.</Text>
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
  },
  header: {
    backgroundColor: '#800000',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#800000',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
