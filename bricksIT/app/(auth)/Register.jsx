// app/(auth)/Register.jsx
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

/* =========================
   API BASE URL
========================= */
const API_URL = Platform.OS === 'web' 
  ? 'https://bricks-backend-qyea.onrender.com/api' 
  : 'http://10.0.2.2:5000/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [specialtiesModal, setSpecialtiesModal] = useState(false);

  // Contractor specialties
  const contractorSpecialties = [
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Renovation',
    'Civil Works',
    'Electrical',
    'Plumbing',
    'Interior Design',
    'Landscaping',
    'Project Management'
  ];

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [sellerForm, setSellerForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    gstNumber: '',
    contactNumber: '',
    businessAddress: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankIFSC: ''
  });

  const [contractorForm, setContractorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    contractorType: '',
    experience: '',
    licenseNumber: '',
    address: '',
    specialties: [],
    projectsCompleted: '0',
    teamSize: '',
    website: ''
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  // Handle form changes
  const handleUserChange = (field, value) => {
    setUserForm({ ...userForm, [field]: value });
  };

  const handleSellerChange = (field, value) => {
    setSellerForm({ ...sellerForm, [field]: value });
  };

  const handleContractorChange = (field, value) => {
    setContractorForm({ ...contractorForm, [field]: value });
  };

  const handleSpecialtyToggle = (specialty) => {
    setContractorForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const validateForm = () => {
    if (!termsAccepted) {
      return 'Please accept the Terms & Conditions';
    }

    if (activeTab === 'user') {
      if (!userForm.name.trim()) return 'Name is required';
      if (!userForm.email.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) return 'Valid email is required';
      if (userForm.password.length < 6) return 'Password must be at least 6 characters';
      if (userForm.phone && !/^[0-9]{10}$/.test(userForm.phone)) return 'Valid 10-digit phone number is required';
    }
    else if (activeTab === 'seller') {
      if (!sellerForm.name.trim()) return 'Owner name is required';
      if (!sellerForm.email.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sellerForm.email)) return 'Valid email is required';
      if (sellerForm.password.length < 6) return 'Password must be at least 6 characters';
      if (!sellerForm.businessName.trim()) return 'Business name is required';
      if (!sellerForm.businessType) return 'Business type is required';
      if (!sellerForm.gstNumber.trim()) return 'GST number is required';
      if (!sellerForm.contactNumber.match(/^[0-9]{10}$/)) return 'Valid 10-digit contact number is required';
      if (!sellerForm.businessAddress.trim()) return 'Business address is required';
      if (!sellerForm.bankAccountNumber.match(/^[0-9]{9,18}$/)) return 'Valid bank account number is required';
      if (!sellerForm.bankAccountName.trim()) return 'Bank account name is required';
      if (!sellerForm.bankIFSC.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) return 'Valid IFSC code is required';
    }
    else if (activeTab === 'contractor') {
      if (!contractorForm.name.trim()) return 'Full name is required';
      if (!contractorForm.email.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contractorForm.email)) return 'Valid email is required';
      if (contractorForm.password.length < 6) return 'Password must be at least 6 characters';
      if (!contractorForm.phone.match(/^[0-9]{10}$/)) return 'Valid 10-digit phone number is required';
      if (!contractorForm.companyName.trim()) return 'Company name is required';
      if (!contractorForm.contractorType) return 'Contractor type is required';
      if (!contractorForm.experience || parseInt(contractorForm.experience) < 1) return 'Experience must be at least 1 year';
      if (!contractorForm.licenseNumber.trim()) return 'License number is required';
      if (!contractorForm.address.trim()) return 'Address is required';
      if (contractorForm.specialties.length === 0) return 'Please select at least one specialty';
      if (!contractorForm.teamSize) return 'Team size is required';
    }

    return null;
  };

  /* =========================
     BACKEND REGISTRATION FUNCTIONS
  ========================= */
  const registerUser = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/user/register`, {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        phone: userForm.phone || '',
      });

      return {
        success: true,
        data: response.data,
        message: 'User registered successfully!'
      };
    } catch (error) {
      console.error('User registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'User registration failed. Please try again.'
      };
    }
  };

  const registerSeller = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/seller/register`, {
        name: sellerForm.name,
        email: sellerForm.email,
        password: sellerForm.password,
        businessName: sellerForm.businessName,
        businessType: sellerForm.businessType,
        gstNumber: sellerForm.gstNumber,
        contactNumber: sellerForm.contactNumber,
        businessAddress: sellerForm.businessAddress,
        bankDetails: {
          accountNumber: sellerForm.bankAccountNumber,
          accountName: sellerForm.bankAccountName,
          ifscCode: sellerForm.bankIFSC,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Seller registration submitted successfully!'
      };
    } catch (error) {
      console.error('Seller registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Seller registration failed. Please try again.'
      };
    }
  };

  const registerContractor = async () => {
    try {
      const response = await axios.post(`${API_URL}/contractor/auth/register`, {
        name: contractorForm.name,
        email: contractorForm.email,
        password: contractorForm.password,
        phone: contractorForm.phone,
        companyName: contractorForm.companyName,
        contractorType: contractorForm.contractorType,
        experience: parseInt(contractorForm.experience),
        licenseNumber: contractorForm.licenseNumber,
        address: contractorForm.address,
        specialties: contractorForm.specialties,
        projectsCompleted: parseInt(contractorForm.projectsCompleted) || 0,
        teamSize: contractorForm.teamSize,
        website: contractorForm.website || '',
      });

      return {
        success: true,
        data: response.data,
        message: 'Contractor registered successfully!'
      };
    } catch (error) {
      console.error('Contractor registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Contractor registration failed. Please try again.'
      };
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      let result;
      
      switch (activeTab) {
        case 'user':
          result = await registerUser();
          break;
        case 'seller':
          result = await registerSeller();
          break;
        case 'contractor':
          result = await registerContractor();
          break;
        default:
          throw new Error('Invalid user type');
      }

      if (result.success) {
        setSuccess(result.message);
        
        // Auto-login after successful registration
        setTimeout(async () => {
          try {
            // Auto login after registration
            let loginEndpoint;
            let loginData;
            
            switch (activeTab) {
              case 'user':
                loginEndpoint = `${API_URL}/auth/user/login`;
                loginData = {
                  email: userForm.email,
                  password: userForm.password,
                };
                break;
              case 'seller':
                loginEndpoint = `${API_URL}/auth/seller/login`;
                loginData = {
                  email: sellerForm.email,
                  password: sellerForm.password,
                };
                break;
              case 'contractor':
                loginEndpoint = `${API_URL}/contractor/auth/login`;
                loginData = {
                  email: contractorForm.email,
                  password: contractorForm.password,
                };
                break;
            }

            const loginResponse = await axios.post(loginEndpoint, loginData);
            
            if (loginResponse.data.token) {
              // Store token and user data (you'll need to implement AsyncStorage)
              // For now, we'll just navigate
              
              // Redirect based on role
              setTimeout(() => {
                if (activeTab === 'seller') {
                  router.replace('/(tabs)/seller-dashboard');
                } else if (activeTab === 'contractor') {
                  router.replace('/(tabs)/contractor-dashboard');
                } else {
                  router.replace('/(tabs)');
                }
              }, 1000);
            }
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            // Even if auto-login fails, still redirect to login page
            router.push('/(auth)/login');
          }
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>User Information</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="person" size={16} color="#666" /> Full Name *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={userForm.name}
            onChangeText={(text) => handleUserChange('name', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="call" size={16} color="#666" /> Phone Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="9876543210"
            value={userForm.phone}
            onChangeText={(text) => handleUserChange('phone', text)}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="mail" size={16} color="#666" /> Email Address *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          value={userForm.email}
          onChangeText={(text) => handleUserChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="lock-closed" size={16} color="#666" /> Password *
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="At least 6 characters"
            value={userForm.password}
            onChangeText={(text) => handleUserChange('password', text)}
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
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Password must be at least 6 characters long</Text>
      </View>
    </View>
  );

  const renderSellerForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Seller Information</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="person" size={16} color="#666" /> Owner Name *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={sellerForm.name}
            onChangeText={(text) => handleSellerChange('name', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="business" size={16} color="#666" /> Business Name *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ABC Enterprises"
            value={sellerForm.businessName}
            onChangeText={(text) => handleSellerChange('businessName', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="mail" size={16} color="#666" /> Email Address *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="business@example.com"
          value={sellerForm.email}
          onChangeText={(text) => handleSellerChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="lock-closed" size={16} color="#666" /> Password *
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="At least 6 characters"
              value={sellerForm.password}
              onChangeText={(text) => handleSellerChange('password', text)}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="call" size={16} color="#666" /> Contact Number *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="9876543210"
            value={sellerForm.contactNumber}
            onChangeText={(text) => handleSellerChange('contactNumber', text)}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Business Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="Manufacturer/Distributor"
            value={sellerForm.businessType}
            onChangeText={(text) => handleSellerChange('businessType', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>GST Number *</Text>
          <TextInput
            style={[styles.input, styles.uppercaseInput]}
            placeholder="22ABCDE1234F1Z5"
            value={sellerForm.gstNumber}
            onChangeText={(text) => handleSellerChange('gstNumber', text.toUpperCase())}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="location" size={16} color="#666" /> Business Address *
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter complete business address"
          value={sellerForm.businessAddress}
          onChangeText={(text) => handleSellerChange('businessAddress', text)}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>

      <Text style={styles.sectionTitle}>Bank Details</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="123456789012"
            value={sellerForm.bankAccountNumber}
            onChangeText={(text) => handleSellerChange('bankAccountNumber', text)}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Account Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Account holder name"
            value={sellerForm.bankAccountName}
            onChangeText={(text) => handleSellerChange('bankAccountName', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>IFSC Code *</Text>
          <TextInput
            style={[styles.input, styles.uppercaseInput]}
            placeholder="SBIN0000123"
            value={sellerForm.bankIFSC}
            onChangeText={(text) => handleSellerChange('bankIFSC', text.toUpperCase())}
            editable={!loading}
          />
        </View>
      </View>
    </View>
  );

  const renderContractorForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Contractor Information</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="person" size={16} color="#666" /> Full Name *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="John Contractor"
            value={contractorForm.name}
            onChangeText={(text) => handleContractorChange('name', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="call" size={16} color="#666" /> Phone Number *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="9876543210"
            value={contractorForm.phone}
            onChangeText={(text) => handleContractorChange('phone', text)}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="mail" size={16} color="#666" /> Email Address *
        </Text>
        <TextInput
          style={styles.input}
          placeholder="contractor@example.com"
          value={contractorForm.email}
          onChangeText={(text) => handleContractorChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="lock-closed" size={16} color="#666" /> Password *
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="At least 6 characters"
            value={contractorForm.password}
            onChangeText={(text) => handleContractorChange('password', text)}
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
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="business" size={16} color="#666" /> Company Name *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ABC Construction Co."
            value={contractorForm.companyName}
            onChangeText={(text) => handleContractorChange('companyName', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contractor Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="General/Specialty"
            value={contractorForm.contractorType}
            onChangeText={(text) => handleContractorChange('contractorType', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="trophy" size={16} color="#666" /> Experience (Years) *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={contractorForm.experience}
            onChangeText={(text) => handleContractorChange('experience', text)}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>License Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="LIC-123456"
            value={contractorForm.licenseNumber}
            onChangeText={(text) => handleContractorChange('licenseNumber', text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="people" size={16} color="#666" /> Team Size *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Select size"
            value={contractorForm.teamSize}
            onChangeText={(text) => handleContractorChange('teamSize', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Specialties *</Text>
        <TouchableOpacity
          style={styles.specialtiesButton}
          onPress={() => setSpecialtiesModal(true)}
          disabled={loading}
        >
          <Text style={styles.specialtiesButtonText}>
            {contractorForm.specialties.length > 0 
              ? `${contractorForm.specialties.length} specialties selected`
              : 'Select specialties'}
          </Text>
          <Icon name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <Text style={styles.helperText}>Tap to select specialties</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          <Icon name="location" size={16} color="#666" /> Address *
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Complete address"
          value={contractorForm.address}
          onChangeText={(text) => handleContractorChange('address', text)}
          multiline
          numberOfLines={2}
          editable={!loading}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            <Icon name="globe" size={16} color="#666" /> Website (Optional)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourcompany.com"
            value={contractorForm.website}
            onChangeText={(text) => handleContractorChange('website', text)}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Projects Completed</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={contractorForm.projectsCompleted}
            onChangeText={(text) => handleContractorChange('projectsCompleted', text)}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>
      </View>
    </View>
  );

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
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Join BricksIT today</Text>
          </View>

          {/* Tabs */}
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
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === role && styles.activeTabText,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
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

          {/* Success Message */}
          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successContent}>
                <Icon name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            </View>
          ) : null}

          {/* Form Container */}
          <View style={styles.formContainer}>
            {activeTab === 'user' ? renderUserForm() :
             activeTab === 'seller' ? renderSellerForm() :
             renderContractorForm()}

            {/* Terms & Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
                disabled={loading}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <Icon name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink} onPress={() => Alert.alert('Terms & Conditions', 'Demo terms and conditions.')}>
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy Policy', 'Demo privacy policy.')}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
                <Text style={styles.loginLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 BricksIT. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Specialties Modal for Contractor */}
      <Modal
        visible={specialtiesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSpecialtiesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Specialties</Text>
              <TouchableOpacity onPress={() => setSpecialtiesModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {contractorSpecialties.map((specialty, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.specialtyItem,
                    contractorForm.specialties.includes(specialty) && styles.specialtyItemSelected,
                  ]}
                  onPress={() => handleSpecialtyToggle(specialty)}
                >
                  <View style={styles.specialtyCheckbox}>
                    {contractorForm.specialties.includes(specialty) && (
                      <Icon name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={[
                    styles.specialtyText,
                    contractorForm.specialties.includes(specialty) && styles.specialtyTextSelected,
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                Selected: {contractorForm.specialties.length} specialties
              </Text>
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setSpecialtiesModal(false)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 24,
  },
  tabsInner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    marginBottom: 20,
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
  successContainer: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  successText: {
    color: '#065f46',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uppercaseInput: {
    textTransform: 'uppercase',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  specialtiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  specialtiesButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  termsContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#800000',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: '#800000',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#800000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#800000',
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    maxHeight: 400,
    padding: 20,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  specialtyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtyText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  specialtyTextSelected: {
    color: '#1e40af',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalDoneButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});