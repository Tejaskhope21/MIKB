import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE = 'https://bricks-backend-qyea.onrender.com/api/contractor';
const { width } = Dimensions.get('window');

const ContractorDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Primary color
  const PRIMARY_COLOR = 'rgb(128, 0, 0)'; // Maroon color
  const LIGHT_PRIMARY = 'rgba(128, 0, 0, 0.1)';

  useEffect(() => {
    if (!id || id === 'undefined' || id.trim() === '') {
      setError('Invalid contractor profile link.');
      setLoading(false);
      return;
    }

    const fetchContractor = async () => {
      try {
        const response = await axios.get(`${API_BASE}/${id}`);
        setContractor(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Contractor not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [id]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No phone number available');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    if (!email) {
      Alert.alert('No email available');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website) => {
    if (!website) {
      Alert.alert('No website available');
      return;
    }
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open website');
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading contractor profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: PRIMARY_COLOR }]} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contractor Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Contractor Info Card */}
        <View style={styles.card}>
          <View style={styles.profileSection}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              {contractor.profileImage ? (
                <Image 
                  source={{ uri: contractor.profileImage }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: LIGHT_PRIMARY }]}>
                  <Icon name="business" size={40} color={PRIMARY_COLOR} />
                </View>
              )}
            </View>

            {/* Company Name and Type */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName} numberOfLines={2}>
                {contractor.companyName}
              </Text>
              <Text style={styles.contractorName}>{contractor.name}</Text>
              
              <View style={[styles.contractorTypeBadge, { backgroundColor: LIGHT_PRIMARY }]}>
                <Text style={[styles.contractorTypeText, { color: PRIMARY_COLOR }]}>
                  {contractor.contractorType}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            {contractor.phone && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleCall(contractor.phone)}
              >
                <View style={[styles.contactIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                  <Icon name="phone" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={[styles.contactValue, { color: PRIMARY_COLOR }]}>
                    {formatPhoneNumber(contractor.phone)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contractor.email && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => handleEmail(contractor.email)}
              >
                <View style={[styles.contactIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                  <Icon name="email" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={[styles.contactValue, { color: PRIMARY_COLOR }]}>
                    {contractor.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contractor.address && (contractor.address.city || contractor.address.state) && (
              <View style={styles.contactItem}>
                <View style={[styles.contactIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                  <Icon name="location-on" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Location</Text>
                  <Text style={styles.contactValue}>
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

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                <Icon name="location-on" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Service Area</Text>
              <Text style={styles.statValue}>
                {contractor.address?.city && contractor.address?.state
                  ? `${contractor.address.city}, ${contractor.address.state}`
                  : 'Nationwide'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{contractor.experience || 1}+ Years</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                <Icon name="people" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Team Size</Text>
              <Text style={styles.statValue}>{contractor.teamSize || '1-5'}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}>
                <Icon name="check-circle" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Projects Done</Text>
              <Text style={styles.statValue}>{contractor.projectsCompleted || 0}</Text>
            </View>
          </View>

          {/* Business Details Sections */}
          <View style={styles.sectionsContainer}>
            {/* License Information */}
            {contractor.licenseNumber && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="description" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>License Information</Text>
                </View>
                <View style={[styles.licenseCard, { backgroundColor: LIGHT_PRIMARY, borderColor: PRIMARY_COLOR }]}>
                  <View style={styles.licenseRow}>
                    <Text style={styles.licenseLabel}>License Number</Text>
                    {contractor.isVerified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: '#10B981' }]}>
                        <Icon name="verified" size={16} color="#FFFFFF" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.licenseNumber}>{contractor.licenseNumber}</Text>
                </View>
              </View>
            )}

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="medal" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Specialties</Text>
                </View>
                <View style={styles.specialtiesContainer}>
                  {contractor.specialties.map((spec, index) => (
                    <View 
                      key={index} 
                      style={[styles.specialtyTag, { backgroundColor: LIGHT_PRIMARY, borderColor: PRIMARY_COLOR }]}
                    >
                      <Text style={[styles.specialtyText, { color: PRIMARY_COLOR }]}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Portfolio Summary */}
            {contractor.portfolio && contractor.portfolio.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="briefcase-check" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Portfolio ({contractor.portfolio.length} Projects)</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.portfolioScroll}
                  contentContainerStyle={styles.portfolioContainer}
                >
                  {contractor.portfolio.slice(0, 3).map((project, index) => (
                    <View key={index} style={styles.portfolioItem}>
                      <Text style={styles.projectTitle} numberOfLines={1}>
                        {project.title}
                      </Text>
                      <Text style={styles.projectCategory}>{project.category}</Text>
                      <View style={styles.projectFooter}>
                        <Text style={styles.projectYear}>{project.year}</Text>
                        <View style={[styles.projectStatus, { 
                          backgroundColor: project.status === 'Completed' ? '#10B981' : '#F59E0B' 
                        }]}>
                          <Text style={styles.projectStatusText}>{project.status}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                {contractor.portfolio.length > 3 && (
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={[styles.viewAllText, { color: PRIMARY_COLOR }]}>
                      View all {contractor.portfolio.length} projects
                    </Text>
                    <Icon name="arrow-forward" size={20} color={PRIMARY_COLOR} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Additional Business Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <View style={styles.additionalInfoGrid}>
                {contractor.website && (
                  <TouchableOpacity 
                    style={styles.infoCard}
                    onPress={() => handleWebsite(contractor.website)}
                  >
                    <Icon name="language" size={20} color={PRIMARY_COLOR} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Website</Text>
                      <Text style={[styles.infoValue, { color: PRIMARY_COLOR }]} numberOfLines={1}>
                        {contractor.website.replace(/^https?:\/\//, '')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {contractor.gstNumber && (
                  <View style={styles.infoCard}>
                    <Icon name="receipt" size={20} color={PRIMARY_COLOR} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>GST Number</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {contractor.gstNumber}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Banking Information */}
              {contractor.bankDetails && (
                <View style={[styles.bankingCard, { backgroundColor: LIGHT_PRIMARY, borderColor: PRIMARY_COLOR }]}>
                  <Text style={[styles.bankingTitle, { color: PRIMARY_COLOR }]}>Banking Information</Text>
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
                        <Text style={[styles.bankingValue, styles.monoText]}>{contractor.bankDetails.ifscCode}</Text>
                      </View>
                    )}
                    {contractor.bankDetails.upiId && (
                      <View style={styles.bankingItem}>
                        <Text style={styles.bankingLabel}>UPI ID</Text>
                        <Text style={[styles.bankingValue, styles.monoText]}>{contractor.bankDetails.upiId}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  contractorTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contractorTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactSection: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionsContainer: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  licenseCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  licenseLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  licenseNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  portfolioScroll: {
    marginHorizontal: -20,
  },
  portfolioContainer: {
    paddingHorizontal: 20,
  },
  portfolioItem: {
    width: width * 0.6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectYear: {
    fontSize: 12,
    color: '#94A3B8',
  },
  projectStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  projectStatusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  additionalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  bankingCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  bankingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bankingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankingItem: {
    flex: 1,
    minWidth: '48%',
    marginRight: 12,
    marginBottom: 12,
  },
  bankingLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bankingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 40,
  },
});

export default ContractorDetail;