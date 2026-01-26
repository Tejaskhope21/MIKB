// app/(tabs)/SettingsScreen.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Try to load from AsyncStorage first for faster display
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const userData = JSON.parse(storedData);
          setUser(userData);
          setEditFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
        }
      } catch (storageError) {
        console.warn('Storage load warning:', storageError);
      }

      // Try to get fresh data from API
      const res = await authAPI.getProfile();
      console.log('Profile API Response:', res); // Debug log
      
      // Handle different possible response structures
      let userData = null;
      
      if (res && typeof res === 'object') {
        // Check different possible response structures
        if (res.data && res.data.user) {
          userData = res.data.user;
        } else if (res.user) {
          userData = res.user;
        } else if (res.data) {
          userData = res.data;
        } else if (res.success && res.data) {
          userData = res.data.user || res.data;
        } else {
          // Use the response itself as user data
          userData = res;
        }
      }
      
      if (userData) {
        setUser(userData);
        setEditFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        
        // Save to AsyncStorage
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } catch (storageError) {
          console.warn('Storage save warning:', storageError);
        }
      } else {
        // No user data found in response
        console.warn('No user data found in API response');
        if (!user) {
          // Only show alert if we don't have cached data
          Alert.alert(
            'Info',
            'Could not load profile data. Please try again later.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('PROFILE LOAD ERROR', err);
      
      // If API fails and we don't have cached data, show error
      if (!user) {
        Alert.alert(
          'Connection Error',
          'Failed to load profile. Using cached data if available.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!editFormData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSaving(true);

    try {
      const res = await authAPI.updateProfile(editFormData);
      console.log('Update Profile API Response:', res); // Debug log
      
      // Handle different possible response structures
      let updatedUser = null;
      
      if (res && typeof res === 'object') {
        // Check different possible response structures
        if (res.data && res.data.user) {
          updatedUser = res.data.user;
        } else if (res.user) {
          updatedUser = res.user;
        } else if (res.data) {
          updatedUser = res.data;
        } else if (res.success && res.data) {
          updatedUser = res.data.user || res.data;
        } else {
          // Use the response itself as user data
          updatedUser = res;
        }
      }
      
      if (updatedUser) {
        setUser(updatedUser);
        
        // Update AsyncStorage
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        } catch (storageError) {
          console.warn('Storage update warning:', storageError);
        }

        setEditModalVisible(false);
        
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [{ text: 'OK' }]
        );
      } else {
        // No user data returned
        Alert.alert(
          'Error',
          'Profile update completed but no data was returned.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('PROFILE UPDATE ERROR', err);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Extract error message from response if available
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to update profile.';
        } else if (err.response.status === 422) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear storage
              await AsyncStorage.multiRemove(['token', 'userData']);
              
              // Navigate to login
              router.replace('/(auth)/Login');
            } catch (err) {
              console.error('LOGOUT ERROR:', err);
              Alert.alert('Error', 'Logout failed');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editIcon}
              onPress={() => setEditModalVisible(true)}
            >
              <Icon name="pencil" size={16} color="#800000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          
          <View style={styles.userInfoRow}>
            <Icon name="call-outline" size={16} color="#666" />
            <Text style={styles.userPhone}>{user?.phone || 'Not set'}</Text>
          </View>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={20} color="#800000" />
            <Text style={styles.cardTitle}>Profile Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="person-circle-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Name</Text>
            </View>
            <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="mail-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="call-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Phone</Text>
            </View>
            <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => setEditModalVisible(true)}
          >
            <Icon name="create-outline" size={18} color="#800000" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Card */}
        <View style={[styles.card, styles.appInfoCard]}>
          <View style={styles.cardHeader}>
            <Icon name="information-circle-outline" size={20} color="#800000" />
            <Text style={styles.cardTitle}>App Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>Jan 2024</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>© 2024 BricksIT. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !saving && setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => !saving && setEditModalVisible(false)}
                disabled={saving}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({...editFormData, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  editable={!saving}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({...editFormData, email: text})}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!saving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({...editFormData, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  editable={!saving}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, saving && styles.buttonDisabled]}
                  onPress={() => setEditModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#800000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  appInfoCard: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#800000',
    marginLeft: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    backgroundColor: '#800000',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  modalBody: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#800000',
    padding: 16,
    borderRadius: 12,
    marginLeft: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#a05252',
    opacity: 0.7,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});