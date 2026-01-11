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
import { addressesAPI } from '../services/userApi';

const AddressScreen = () => {
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
    // addressType will be set to 'home' by default in payload
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressesAPI.fetchUserAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error('Fetch addresses failed:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // =============================================
  //  Critical: Exact mapping to backend schema
  // =============================================
  const preparePayload = () => ({
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    addressLine: formData.addressLine.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    pincode: formData.pincode.trim(),
    country: formData.country.trim(),
    addressType: 'home',           // ← required field, using default
    isDefault: formData.isDefault,
  });

  const handleSubmit = async () => {
    if (submitting) return;

    // Validation
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      Alert.alert('Error', 'Pincode must be exactly 6 digits');
      return;
    }

    try {
      setSubmitting(true);

      await addressesAPI.addAddress(preparePayload());

      Alert.alert('Success', 'Address added successfully!');
      resetForm();
      setModalVisible(false);
      await fetchAddresses(); // Refresh list immediately
    } catch (error) {
      console.error('ADD ADDRESS ERROR:', error?.response?.data || error);

      const msg =
        error?.response?.data?.message ||
        'Failed to add address. Please check your input or try again.';

      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressesAPI.setDefaultAddress(id);
      await fetchAddresses();
      Alert.alert('Success', 'Default address updated!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to set default');
    }
  };

const handleDelete = async (id) => {

  if (!id) {
    alert('Invalid address ID');
    return;
  }

  const addr = addresses.find((a) => a._id === id);
  if (!addr) {
    alert('Address not found');
    return;
  }

  if (addr.isDefault && addresses.length > 1) {
    alert('Set another address as default before deleting this one.');
    return;
  }

  // ✅ WEB CONFIRMATION
  const confirmed = window.confirm(
    'Are you sure you want to delete this address?'
  );

  if (!confirmed) return;

  try {
   

    const res = await addressesAPI.deleteAddress(id);

   

    // 🔥 Update UI instantly
    setAddresses((prev) => prev.filter((a) => a._id !== id));

    alert('Address deleted successfully!');
  } catch (err) {
    console.error(
      'DELETE ERROR:',
      err?.response?.status,
      err?.response?.data || err.message
    );

    alert(err?.response?.data?.message || 'Failed to delete address');
  }
};



  const renderAddressCard = (address) => (
    <View key={address._id} style={styles.addressCard}>
      {address.isDefault && (
        <View style={styles.defaultBadge}>
          <Icon name="checkmark-circle" size={12} color="#2e7d32" />
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}

      <Text style={styles.addressName}>{address.fullName}</Text>

      <View style={styles.phoneContainer}>
        <Icon name="call" size={16} color="#800000" />
        <Text style={styles.phoneText}>{address.phone}</Text>
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{address.addressLine}</Text>
        <Text style={styles.addressText}>
          {address.city}, {address.state} - {address.pincode}, {address.country}
        </Text>
      </View>

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultBtn}
            onPress={() => handleSetDefault(address._id)}
          >
            <Icon name="star" size={16} color="#800000" />
            <Text style={styles.setDefaultText}>Set Default</Text>
          </TouchableOpacity>
        )}

        <button
  className="deleteBtn"
  onClick={() => handleDelete(address._id)}
>
  🗑 Delete
</button>


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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back('/profile')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Icon name="add-circle" size={20} color="#800000" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>

        <View style={styles.addressList}>
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="location-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No addresses found</Text>
              <Text style={styles.emptySubtext}>Add your first address to get started</Text>
            </View>
          ) : (
            addresses.map(renderAddressCard)
          )}
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
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
                  value={formData.fullName}
                  onChangeText={(v) => handleInputChange('fullName', v)}
                  placeholder="Enter full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(v) => handleInputChange('phone', v)}
                  placeholder="Enter 10-digit number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.addressLine}
                  onChangeText={(v) => handleInputChange('addressLine', v)}
                  placeholder="House no, street, area"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(v) => handleInputChange('city', v)}
                  placeholder="Enter city"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(v) => handleInputChange('state', v)}
                  placeholder="Enter state"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Pincode *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pincode}
                  onChangeText={(v) => handleInputChange('pincode', v)}
                  placeholder="6-digit pincode"
                  keyboardType="numeric"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  editable={false}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => handleInputChange('isDefault', !formData.isDefault)}
                >
                  <View
                    style={[
                      styles.checkboxInput,
                      formData.isDefault && styles.checkboxInputChecked,
                    ]}
                  >
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
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Address</Text>
                  )}
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
    marginBottom: 16,
  },
  addressText: {
    color: '#555',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  defaultAddressActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
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

export default AddressScreen;