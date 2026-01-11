import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// API configuration for React Native - FIXED VERSION
// Import Platform separately to avoid issues
import { Platform } from 'react-native';

const API_BASE = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api'
});

const ContractorProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Check login status
    const checkLoginStatus = async () => {
      // You can use AsyncStorage or your auth context here
      // For now, we'll assume not logged in
      setIsLoggedIn(false);
      setCurrentUserId(null);
    };

    checkLoginStatus();
    fetchContractor();
  }, [id]);

  const fetchContractor = async () => {
    if (!id) {
      setError('Invalid contractor profile link.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/contractor/${id}`);
      setContractor(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Contractor not found.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const handlePhonePress = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsitePress = (website) => {
    if (website) {
      let url = website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  const renderStars = (rating) => {
    const num = parseFloat(rating) || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= num ? "star" : "star-border"}
          size={14}
          color={i <= num ? "#FFD700" : "#CCCCCC"}
          style={{ marginRight: 1 }}
        />
      );
    }
    
    return (
      <View style={styles.starContainer}>
        {stars}
        <Text style={styles.ratingText}>{num.toFixed(1)}</Text>
      </View>
    );
  };

  // Check if current user is the contractor owner
  const isContractorOwner = contractor?.userId?._id === currentUserId || 
                          contractor?.userId === currentUserId;

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contractor Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !contractor) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contractor Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#800000" />
          <Text style={styles.errorText}>{error || 'Contractor not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchContractor}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#800000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contractor Profile</Text>
        {isContractorOwner && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowImageModal(true)}
          >
            <Icon name="edit" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {contractor.profileImage ? (
              <Image 
                source={{ uri: contractor.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="business" size={40} color="#800000" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.companyName} numberOfLines={2}>
              {contractor.companyName}
            </Text>
            <Text style={styles.contractorName}>{contractor.name}</Text>
            
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{contractor.contractorType || 'Contractor'}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactGrid}>
            {contractor.phone && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handlePhonePress(contractor.phone)}
                activeOpacity={0.7}
              >
                <Icon name="phone" size={20} color="#800000" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>
                    {formatPhoneNumber(contractor.phone)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contractor.email && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleEmailPress(contractor.email)}
                activeOpacity={0.7}
              >
                <Icon name="email" size={20} color="#800000" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {contractor.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contractor.address && (contractor.address.city || contractor.address.state) && (
              <View style={styles.contactItem}>
                <Icon name="location-on" size={20} color="#800000" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Location</Text>
                  <Text style={styles.contactValue} numberOfLines={2}>
                    {contractor.address.city && contractor.address.state
                      ? `${contractor.address.city}, ${contractor.address.state}`
                      : contractor.address.city || contractor.address.state || 'Nationwide'}
                    {contractor.address.country && contractor.address.country !== 'India' && 
                      `, ${contractor.address.country}`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="location-on" size={20} color="#666" />
            <Text style={styles.statLabel}>Service Area</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {contractor.address?.city && contractor.address?.state
                ? `${contractor.address.city}, ${contractor.address.state}`
                : 'Nationwide'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="calendar-today" size={20} color="#666" />
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{contractor.experience || 1}+ Years</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="people" size={20} color="#666" />
            <Text style={styles.statLabel}>Team Size</Text>
            <Text style={styles.statValue}>{contractor.teamSize || '1-5'}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="check-circle" size={20} color="#666" />
            <Text style={styles.statLabel}>Projects Done</Text>
            <Text style={styles.statValue}>{contractor.projectsCompleted || 0}</Text>
          </View>
        </View>

        {/* License Information */}
        {contractor.licenseNumber && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="description" size={22} color="#10B981" />
              <Text style={styles.sectionTitle}>License Information</Text>
            </View>
            
            <View style={styles.licenseCard}>
              <View style={styles.licenseHeader}>
                <View>
                  <Text style={styles.licenseLabel}>License Number</Text>
                  <Text style={styles.licenseNumber}>{contractor.licenseNumber}</Text>
                </View>
                {contractor.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon name="verified" size={16} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Specialties */}
        {contractor.specialties && contractor.specialties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="star" size={22} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Specialties</Text>
            </View>
            
            <View style={styles.specialtiesContainer}>
              {contractor.specialties.map((spec, index) => (
                <View key={index} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Portfolio Summary */}
        {contractor.portfolio && contractor.portfolio.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="work" size={22} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Portfolio ({contractor.portfolio.length} Projects)</Text>
            </View>
            
            <View style={styles.portfolioGrid}>
              {contractor.portfolio.slice(0, 3).map((project, index) => (
                <View key={index} style={styles.projectCard}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.title}
                  </Text>
                  <Text style={styles.projectCategory} numberOfLines={1}>
                    {project.category}
                  </Text>
                  <View style={styles.projectFooter}>
                    <Text style={styles.projectYear}>{project.year}</Text>
                    <Text style={styles.projectStatus}>{project.status}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            {contractor.portfolio.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {contractor.portfolio.length} projects
                </Text>
                <Icon name="arrow-forward" size={16} color="#800000" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.additionalInfoGrid}>
            {contractor.website && (
              <TouchableOpacity 
                style={styles.infoCard}
                onPress={() => handleWebsitePress(contractor.website)}
                activeOpacity={0.7}
              >
                <Icon name="language" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {contractor.website.replace(/^https?:\/\//, '')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contractor.gstNumber && (
              <View style={styles.infoCard}>
                <Icon name="receipt" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>GST Number</Text>
                  <Text style={styles.infoValue}>{contractor.gstNumber}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Banking Information */}
          {contractor.bankDetails && (
            <View style={styles.bankingCard}>
              <Text style={styles.bankingTitle}>Banking Information</Text>
              
              <View style={styles.bankingGrid}>
                {contractor.bankDetails.accountName && (
                  <View style={styles.bankingItem}>
                    <Text style={styles.bankingLabel}>Account Name</Text>
                    <Text style={styles.bankingValue}>{contractor.bankDetails.accountName}</Text>
                  </View>
                )}
                
                {contractor.bankDetails.bankName && (
                  <View style={styles.bankingItem}>
                    <Text style={styles.bankingLabel}>Bank Name</Text>
                    <Text style={styles.bankingValue}>{contractor.bankDetails.bankName}</Text>
                  </View>
                )}
                
                {contractor.bankDetails.ifscCode && (
                  <View style={styles.bankingItem}>
                    <Text style={styles.bankingLabel}>IFSC Code</Text>
                    <Text style={styles.bankingValue}>{contractor.bankDetails.ifscCode}</Text>
                  </View>
                )}
                
                {contractor.bankDetails.upiId && (
                  <View style={styles.bankingItem}>
                    <Text style={styles.bankingLabel}>UPI ID</Text>
                    <Text style={styles.bankingValue}>{contractor.bankDetails.upiId}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rating</Text>
          <View style={styles.ratingContent}>
            {renderStars(contractor.rating || 0)}
          </View>
        </View>
      </ScrollView>

      {/* Image Upload Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Image</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.imagePreviewContainer}>
                {contractor.profileImage ? (
                  <Image 
                    source={{ uri: contractor.profileImage }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.noImagePreview}>
                    <Icon name="photo-camera" size={40} color="#CCC" />
                    <Text style={styles.noImageText}>No profile image</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.modalText}>
                {isContractorOwner 
                  ? 'You can update your profile image from settings'
                  : 'Profile image'}
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowImageModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
                
                {isContractorOwner && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.uploadButton]}
                    onPress={() => {
                      // Handle image upload here
                      Alert.alert('Info', 'Image upload functionality will be added');
                    }}
                  >
                    <Text style={styles.uploadButtonText}>Change Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// FIX: Move Platform import to top of the file to ensure it's available in styles
const { Platform: PlatformOS } = require('react-native');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#800000',
    paddingHorizontal: 15,
    paddingTop: PlatformOS.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#800000',
  },
  // Sections
  section: {
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  // Contact Information
  contactGrid: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  contactInfo: {
    marginLeft: 15,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  // Stats Grid
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 15,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  // License Information
  licenseCard: {
    backgroundColor: '#F0F9F5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    padding: 15,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  licenseLabel: {
    fontSize: 12,
    color: '#065F46',
    marginBottom: 4,
  },
  licenseNumber: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 4,
    fontWeight: '600',
  },
  // Specialties
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  specialtyBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  // Portfolio
  portfolioGrid: {
    marginTop: 10,
  },
  projectCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectYear: {
    fontSize: 12,
    color: '#888',
  },
  projectStatus: {
    fontSize: 12,
    color: '#800000',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: '#800000',
    fontWeight: '600',
    marginRight: 4,
  },
  // Additional Information
  additionalInfoGrid: {
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  // Banking Information
  bankingCard: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  bankingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  bankingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankingItem: {
    width: '50%',
    marginBottom: 15,
  },
  bankingLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 4,
  },
  bankingValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  // Rating
  ratingSection: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 20,
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  ratingContent: {
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 8,
  },
  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    fontSize: 16,
    color: '#800000',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: '#800000',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  noImagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#800000',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default ContractorProfileScreen;