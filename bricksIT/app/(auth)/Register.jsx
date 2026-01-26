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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://bricks-backend-qyea.onrender.com/api';
const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('contractor'); // Default to contractor
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [specialtiesModal, setSpecialtiesModal] = useState(false);
  const [teamSizeModal, setTeamSizeModal] = useState(false);
  const [contractorTypeModal, setContractorTypeModal] = useState(false);
  const [businessTypeModal, setBusinessTypeModal] = useState(false);

  // Contractor data options
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

  const teamSizeOptions = [
    { label: '1-5 People', value: '1-5' },
    { label: '5-20 People', value: '5-20' },
    { label: '20-50 People', value: '20-50' },
    { label: '50+ People', value: '50+' }
  ];

  const contractorTypeOptions = [
    'General Contractor',
    'Specialty Contractor',
    'Subcontractor',
    'Builder',
    'Civil Engineer'
  ];

  const businessTypeOptions = [
    'Manufacturer',
    'Distributor',
    'Retailer',
    'Wholesaler'
  ];

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

  const selectTeamSize = (size) => {
    handleContractorChange('teamSize', size);
    setTeamSizeModal(false);
  };

  const selectContractorType = (type) => {
    handleContractorChange('contractorType', type);
    setContractorTypeModal(false);
  };

  const selectBusinessType = (type) => {
    handleSellerChange('businessType', type);
    setBusinessTypeModal(false);
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
      let endpoint;
      let payload;

      if (activeTab === 'contractor') {
        endpoint = `${API_URL}/contractor/auth/register`;
        payload = {
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
        };
      } else if (activeTab === 'seller') {
        endpoint = `${API_URL}/auth/seller/register`;
        payload = {
          name: sellerForm.name,
          email: sellerForm.email,
          password: sellerForm.password,
          businessName: sellerForm.businessName,
          businessType: sellerForm.businessType,
          gstNumber: sellerForm.gstNumber,
          contactNumber: sellerForm.contactNumber,
          businessAddress: sellerForm.businessAddress,
          bankAccountNumber: sellerForm.bankAccountNumber,
          bankAccountName: sellerForm.bankAccountName,
          bankIFSC: sellerForm.bankIFSC,
        };
      } else {
        endpoint = `${API_URL}/auth/user/register`;
        payload = {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          phone: userForm.phone || '',
        };
      }

      console.log('Sending registration request to:', endpoint);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(endpoint, payload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        let successMessage = response.data.message || 'Registration successful!';

        if (activeTab === 'contractor') {
          successMessage = "Contractor registered successfully! 🎉\nYour profile is under review. We'll notify you via email once approved.";
          
          // Store token and user data using AsyncStorage
          const token = response.data.token;
          const userData = response.data.contractor;
          
          try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userRole', 'contractor');
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            console.log('User data saved to AsyncStorage');
          } catch (storageError) {
            console.error('Error saving to AsyncStorage:', storageError);
          }

          setTimeout(() => {
            router.push('/portfolio/');
          }, 2500);
        } else if (activeTab === 'seller') {
          successMessage = "Seller registration submitted! Awaiting admin approval.";
          setTimeout(() => router.push('/login'), 3500);
        } else {
          // For regular users
          const token = response.data.token;
          const userData = response.data.user;
          
          try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userRole', 'user');
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          } catch (storageError) {
            console.error('Error saving to AsyncStorage:', storageError);
          }

          setTimeout(() => {
            router.push('/(tabs)/');
          }, 2500);
        }

        setSuccess(successMessage);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          data: err.config?.data
        }
      });
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        // Log detailed error for debugging
        console.log('Server error details:', err.response.data);
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data submitted. Please check your information.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render functions remain the same...
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
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setBusinessTypeModal(true)}
            disabled={loading}
          >
            <Text style={sellerForm.businessType ? styles.selectInputText : styles.selectInputPlaceholder}>
              {sellerForm.businessType || 'Select Type'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
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
        <Text style={styles.helperText}>Password must be at least 6 characters long</Text>
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
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setContractorTypeModal(true)}
            disabled={loading}
          >
            <Text style={contractorForm.contractorType ? styles.selectInputText : styles.selectInputPlaceholder}>
              {contractorForm.contractorType || 'Select Type'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setTeamSizeModal(true)}
            disabled={loading}
          >
            <Text style={contractorForm.teamSize ? styles.selectInputText : styles.selectInputPlaceholder}>
              {contractorForm.teamSize ? teamSizeOptions.find(opt => opt.value === contractorForm.teamSize)?.label : 'Select Size'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Specialties *</Text>
        <TouchableOpacity
          style={styles.specialtiesButton}
          onPress={() => setSpecialtiesModal(true)}
          disabled={loading}
        >
          <Text style={contractorForm.specialties.length > 0 ? styles.specialtiesButtonText : styles.specialtiesButtonPlaceholder}>
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
          {/* Header with #800000 background */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Icon name="cube" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Join BricksIT</Text>
              <Text style={styles.headerSubtitle}>Choose your account type to get started</Text>
            </View>
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
                  <Icon 
                    name={
                      role === 'user' ? 'person' : 
                      role === 'seller' ? 'storefront' : 'construct'
                    } 
                    size={20} 
                    color={activeTab === role ? '#fff' : '#666'} 
                    style={styles.tabIcon}
                  />
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
                  Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
                <Text style={styles.loginLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 BricksIT. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals remain the same... */}
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

      {/* Team Size Modal */}
      <Modal
        visible={teamSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTeamSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team Size</Text>
              <TouchableOpacity onPress={() => setTeamSizeModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {teamSizeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    contractorForm.teamSize === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => selectTeamSize(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    contractorForm.teamSize === option.value && styles.optionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {contractorForm.teamSize === option.value && (
                    <Icon name="checkmark" size={20} color="#800000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contractor Type Modal */}
      <Modal
        visible={contractorTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setContractorTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contractor Type</Text>
              <TouchableOpacity onPress={() => setContractorTypeModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {contractorTypeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    contractorForm.contractorType === option && styles.optionItemSelected,
                  ]}
                  onPress={() => selectContractorType(option)}
                >
                  <Text style={[
                    styles.optionText,
                    contractorForm.contractorType === option && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                  {contractorForm.contractorType === option && (
                    <Icon name="checkmark" size={20} color="#800000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Business Type Modal for Seller */}
      <Modal
        visible={businessTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBusinessTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business Type</Text>
              <TouchableOpacity onPress={() => setBusinessTypeModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {businessTypeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    sellerForm.businessType === option && styles.optionItemSelected,
                  ]}
                  onPress={() => selectBusinessType(option)}
                >
                  <Text style={[
                    styles.optionText,
                    sellerForm.businessType === option && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                  {sellerForm.businessType === option && (
                    <Icon name="checkmark" size={20} color="#800000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  },
  header: {
    backgroundColor: '#800000',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
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
    fontSize: 28,
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
  tabsContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  tabsInner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 24,
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
    marginBottom: 16,
    marginHorizontal: 24,
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
    marginHorizontal: 24,
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
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
    minWidth: width > 768 ? 'auto' : '100%',
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
  selectInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectInputText: {
    fontSize: 16,
    color: '#111827',
  },
  selectInputPlaceholder: {
    fontSize: 16,
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
  textArea: {
    minHeight: 80,
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
  specialtiesButtonPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
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
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
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
    maxWidth: 500,
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
    backgroundColor: '#3b82f6',
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionItemSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#800000',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#800000',
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
