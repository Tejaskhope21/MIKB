// app/(tabs)/Addresses/AddressesScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddressScreen = () => {
  const router = useRouter();
  
  // Storage key for addresses
  const ADDRESSES_STORAGE_KEY = 'user_addresses';
  
  // Sample initial data
  const initialAddresses = [
    {
      id: 1,
      name: "Yadnesh Umredkar",
      phone: "9022965759",
      addressLine1: "juni manglwari gujari chowk",
      addressLine2: "",
      city: "nagpur",
      state: "Maharashtra",
      zipCode: "440008",
      country: "India",
      isDefault: true,
      line1Checked: false,
      line2Checked: true
    },
    {
      id: 2,
      name: "Yadnesh Umredkar",
      phone: "9022965759",
      addressLine1: "juni manglwari gujari chowk",
      addressLine2: "",
      city: "nagpur",
      state: "Maharashtra",
      zipCode: "440008",
      country: "India",
      isDefault: false,
      line1Checked: false,
      line2Checked: true
    }
  ];

  const [addresses, setAddresses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);

  // Load addresses from storage on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Load addresses from AsyncStorage
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const savedAddresses = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
      
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        // If no saved addresses, use initial data
        setAddresses(initialAddresses);
        await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(initialAddresses));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Fallback to initial data if storage fails
      setAddresses(initialAddresses);
    } finally {
      setLoading(false);
    }
  };

  // Save addresses to AsyncStorage
  const saveAddresses = async (updatedAddresses) => {
    try {
      await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  };

  // Initialize form when editing
  useEffect(() => {
    if (editingAddress) {
      setFormData(editingAddress);
    } else {
      setFormData({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false,
      });
    }
  }, [editingAddress]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    // ZIP code validation
    const zipRegex = /^[0-9]{6}$/;
    if (!zipRegex.test(formData.zipCode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit ZIP code');
      return;
    }

    let updatedAddresses;

    if (editingAddress) {
      // Update existing address
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr
      );
      
      // If set as default, update other addresses
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === editingAddress.id
        }));
      }
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now(), // Use timestamp for unique ID
        line1Checked: false,
        line2Checked: true
      };
      
      // If set as default, update other addresses
      if (formData.isDefault) {
        updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
        updatedAddresses.push(newAddress);
      } else {
        updatedAddresses = [...addresses, newAddress];
      }
    }

    // Save to state and storage
    setAddresses(updatedAddresses);
    await saveAddresses(updatedAddresses);

    setModalVisible(false);
    setEditingAddress(null);
    
    // Show success message
    Alert.alert(
      'Success', 
      editingAddress ? 'Address updated successfully!' : 'Address added successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleSetDefault = async (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    setAddresses(updatedAddresses);
    await saveAddresses(updatedAddresses);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            
            // If we deleted the default address and there are other addresses,
            // set the first address as default
            const deletedAddress = addresses.find(addr => addr.id === id);
            if (deletedAddress?.isDefault && updatedAddresses.length > 0) {
              updatedAddresses[0].isDefault = true;
            }
            
            setAddresses(updatedAddresses);
            await saveAddresses(updatedAddresses);
            
            Alert.alert('Success', 'Address deleted successfully!');
          }
        }
      ]
    );
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setModalVisible(true);
  };

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      {address.isDefault && (
        <View style={styles.defaultBadge}>
          <Icon name="checkmark-circle" size={12} color="#2e7d32" />
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}

      <Text style={styles.addressName}>{address.name}</Text>
      
      <View style={styles.phoneContainer}>
        <Icon name="call" size={16} color="#800000" />
        <Text style={styles.phoneText}>{address.phone}</Text>
      </View>

      <View style={styles.addressDetails}>
        <View style={styles.addressLine}>
          <View style={[styles.checkbox, address.line1Checked ? styles.checked : styles.unchecked]}>
            {address.line1Checked && <Icon name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.addressText}>{address.addressLine1}</Text>
        </View>
        
        <View style={styles.addressLine}>
          <View style={[styles.checkbox, address.line2Checked ? styles.checked : styles.unchecked]}>
            {address.line2Checked && <Icon name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.addressText}>
            {address.city}, {address.state} - {address.zipCode} {address.country}
          </Text>
        </View>
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault ? (
          <>
            <TouchableOpacity 
              style={styles.setDefaultBtn}
              onPress={() => handleSetDefault(address.id)}
            >
              <Icon name="star" size={16} color="#800000" />
              <Text style={styles.setDefaultText}>Set Default</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleDelete(address.id)}
            >
              <Icon name="trash" size={16} color="#ff4444" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.deleteBtn, styles.deleteOnlyBtn]}
            onPress={() => handleDelete(address.id)}
          >
            <Icon name="trash" size={16} color="#ff4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => handleEdit(address)}
        >
          <Icon name="create" size={16} color="#3498db" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.addAddressBtn}
          onPress={() => {
            setEditingAddress(null);
            setModalVisible(true);
          }}
        >
          <Icon name="add-circle" size={20} color="#800000" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>

        <View style={styles.addressList}>
          {addresses.length > 0 ? (
            addresses.map(renderAddressCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="location-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No addresses found</Text>
              <Text style={styles.emptySubtext}>Add your first address to get started</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Icon name="information-circle" size={18} color="#666" />
          <Text style={styles.infoText}>
            Your addresses are saved locally on your device
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingAddress(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingAddress(null);
                }}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.addressLine1}
                  onChangeText={(text) => handleInputChange('addressLine1', text)}
                  placeholder="Enter street address, building, etc."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 2 (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.addressLine2}
                  onChangeText={(text) => handleInputChange('addressLine2', text)}
                  placeholder="Apartment, suite, floor, etc."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                  placeholder="Enter city"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => handleInputChange('state', text)}
                  placeholder="Enter state"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zipCode}
                  onChangeText={(text) => handleInputChange('zipCode', text)}
                  placeholder="Enter 6-digit ZIP code"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => handleInputChange('country', text)}
                  placeholder="Enter country"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleInputChange('isDefault', !formData.isDefault)}
                >
                  <View style={[styles.checkboxInput, formData.isDefault && styles.checkboxInputChecked]}>
                    {formData.isDefault && <Icon name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingAddress(null);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveBtn}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveBtnText}>
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#800000',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#800000',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addAddressText: {
    color: '#800000',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  addressList: {
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5eb',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  defaultBadgeText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneText: {
    color: '#555',
    fontSize: 15,
    marginLeft: 8,
  },
  addressDetails: {
    marginLeft: 5,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#eaeaea',
    marginBottom: 16,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  unchecked: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
  },
  addressText: {
    color: '#555',
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  setDefaultText: {
    color: '#800000',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteOnlyBtn: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf5ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  editText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    backgroundColor: '#800000',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxInput: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInputChecked: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#444',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
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
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddressScreen;