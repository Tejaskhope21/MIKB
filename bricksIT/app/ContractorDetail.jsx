import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const API_BASE = "http://localhost:5000/api/contractor";
const { width } = Dimensions.get("window");

// Your company's static contact details
const COMPANY_CONTACT = {
  phone: "+91-1234567890",
  email: "info@brickscompany.com",
  website: "www.brickscompany.com",
  address: "123 Construction Street, Mumbai, Maharashtra 400001",
  companyName: "Bricks Construction Services",
  supportHours: "Mon-Sat: 9 AM - 6 PM",
  whatsapp: "+91-1234567890",
};

// Helper function to get complete image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a relative path, construct full URL
  // You may need to adjust this based on your backend setup
  if (imagePath.startsWith("/")) {
    return `http://localhost:5000${imagePath}`;
  }

  // Default fallback
  return imagePath;
};

// Fallback images
const FALLBACK_IMAGES = {
  profile: "https://via.placeholder.com/100/e0e0e0/333333?text=LOGO",
  portfolio: "https://via.placeholder.com/300x200/e0e0e0/333333?text=PROJECT",
};

const ContractorDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState({});

  const PRIMARY_COLOR = "rgb(128, 0, 0)";
  const LIGHT_PRIMARY = "rgba(128, 0, 0, 0.1)";

  useEffect(() => {
    if (!id || id === "undefined" || id.trim() === "") {
      setError("Invalid contractor profile link.");
      setLoading(false);
      return;
    }

    const fetchContractor = async () => {
      try {
        const response = await axios.get(`${API_BASE}/${id}`);
        const contractorData = response.data.data;

        // Process portfolio images
        if (contractorData.portfolio && contractorData.portfolio.length > 0) {
          contractorData.portfolio = contractorData.portfolio.map(
            (project) => ({
              ...project,
              // Ensure image URLs are complete
              images: project.images?.map((img) => getImageUrl(img)) || [],
            }),
          );
        }

        setContractor(contractorData);
      } catch (err) {
        console.error("Error fetching contractor:", err);
        setError(
          err.response?.data?.message ||
            "Contractor not found. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [id]);

  const handleImageError = (type, index = null) => {
    const key = index !== null ? `${type}_${index}` : type;
    setImageError((prev) => ({ ...prev, [key]: true }));
  };

  const handleCall = () => {
    const phoneNumber = COMPANY_CONTACT.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert("Error", "Unable to make call");
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${COMPANY_CONTACT.email}`).catch(() => {
      Alert.alert("Error", "Unable to open email");
    });
  };

  const handleWebsite = () => {
    let url = COMPANY_CONTACT.website;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open website");
    });
  };

  const handleWhatsApp = () => {
    const whatsappNumber = COMPANY_CONTACT.whatsapp.replace(/[^0-9+]/g, "");
    const message = `Hello Bricks Team, I'm interested in contractor: ${contractor?.companyName}`;
    Linking.openURL(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    ).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed");
    });
  };

  const handleContractorWebsite = (website) => {
    if (!website) return;

    let url = website;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open website");
    });
  };

  const renderProjectCard = (project, index) => {
    const hasImages = project.images && project.images.length > 0;
    const imageKey = `portfolio_${index}`;
    const imageUrl = hasImages
      ? getImageUrl(project.images[0])
      : FALLBACK_IMAGES.portfolio;

    return (
      <View key={index} style={styles.portfolioItem}>
        {hasImages && !imageError[imageKey] ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.projectImage}
            resizeMode="cover"
            onError={() => handleImageError("portfolio", index)}
          />
        ) : (
          <View style={styles.projectImagePlaceholder}>
            <Icon name="photo-library" size={40} color={PRIMARY_COLOR} />
            <Text style={styles.projectImageText}>Project Image</Text>
          </View>
        )}

        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle} numberOfLines={2}>
            {project.title || "Project"}
          </Text>
          <Text style={styles.projectCategory}>
            {project.category || "Construction"}
          </Text>

          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar-today" size={12} color="#64748B" />
              <Text style={styles.metaText}>{project.year || "2024"}</Text>
            </View>

            <View style={styles.metaItem}>
              <Icon name="location-on" size={12} color="#64748B" />
              <Text style={styles.metaText} numberOfLines={1}>
                {project.location || "Location"}
              </Text>
            </View>
          </View>

          <View style={styles.projectStatusContainer}>
            <View
              style={[
                styles.projectStatus,
                {
                  backgroundColor:
                    project.status === "completed"
                      ? "#10B981"
                      : project.status === "ongoing"
                        ? "#3B82F6"
                        : "#F59E0B",
                },
              ]}
            >
              <Text style={styles.projectStatusText}>
                {project.status
                  ? project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)
                  : "Planned"}
              </Text>
            </View>

            {project.budget && (
              <Text style={styles.projectBudget}>
                ₹{project.budget.toLocaleString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
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
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: PRIMARY_COLOR }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profileImageUrl = contractor.profileImage
    ? getImageUrl(contractor.profileImage)
    : null;

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
              {profileImageUrl && !imageError.profile ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.profileImage}
                  resizeMode="cover"
                  onError={() => handleImageError("profile")}
                />
              ) : (
                <View
                  style={[
                    styles.profileImagePlaceholder,
                    { backgroundColor: LIGHT_PRIMARY },
                  ]}
                >
                  <Text style={styles.profileInitial}>
                    {contractor.companyName?.charAt(0)?.toUpperCase() || "C"}
                  </Text>
                </View>
              )}
            </View>

            {/* Company Name and Type */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName} numberOfLines={2}>
                {contractor.companyName || "Construction Company"}
              </Text>
              <Text style={styles.contractorName}>
                {contractor.name || "Professional Contractor"}
              </Text>

              <View
                style={[
                  styles.contractorTypeBadge,
                  { backgroundColor: LIGHT_PRIMARY },
                ]}
              >
                <Text
                  style={[styles.contractorTypeText, { color: PRIMARY_COLOR }]}
                >
                  {contractor.contractorType || "General Contractor"}
                </Text>
              </View>
            </View>
          </View>

          {/* Company Contact Information (YOUR COMPANY'S CONTACT) */}
          <View style={styles.contactSection}>
            <View
              style={[styles.contactCard, { backgroundColor: LIGHT_PRIMARY }]}
            >
              <Text style={[styles.contactCardTitle, { color: PRIMARY_COLOR }]}>
                Contact via Bricks Platform
              </Text>
              <Text style={styles.contactCardSubtitle}>
                All inquiries will be routed through our secure platform
              </Text>

              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                  ]}
                >
                  <Icon name="phone" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={[styles.contactValue, { color: PRIMARY_COLOR }]}>
                    {COMPANY_CONTACT.phone}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleEmail}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                  ]}
                >
                  <Icon name="email" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={[styles.contactValue, { color: PRIMARY_COLOR }]}>
                    {COMPANY_CONTACT.email}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleWhatsApp}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                  ]}
                >
                  <Icon name="chat" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>WhatsApp</Text>
                  <Text style={[styles.contactValue, { color: PRIMARY_COLOR }]}>
                    {COMPANY_CONTACT.whatsapp}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.contactItem}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: "rgba(255, 255, 255, 0.9)" },
                  ]}
                >
                  <Icon name="access-time" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Support Hours</Text>
                  <Text style={styles.contactValue}>
                    {COMPANY_CONTACT.supportHours}
                  </Text>
                </View>
              </View>
            </View>

            {/* Contractor's Location (Only public info) */}
            {contractor.address &&
              (contractor.address.city || contractor.address.state) && (
                <View style={styles.contactItem}>
                  <View
                    style={[
                      styles.contactIcon,
                      { backgroundColor: LIGHT_PRIMARY },
                    ]}
                  >
                    <Icon name="location-on" size={20} color={PRIMARY_COLOR} />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactLabel}>Service Area</Text>
                    <Text style={styles.contactValue}>
                      {contractor.address.city && contractor.address.state
                        ? `${contractor.address.city}, ${contractor.address.state}`
                        : contractor.address.city ||
                          contractor.address.state ||
                          "Nationwide"}
                      {contractor.address.country &&
                        contractor.address.country !== "India" &&
                        `, ${contractor.address.country}`}
                    </Text>
                  </View>
                </View>
              )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View
                style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}
              >
                <Icon name="location-on" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Service Area</Text>
              <Text style={styles.statValue}>
                {contractor.address?.city && contractor.address?.state
                  ? `${contractor.address.city}, ${contractor.address.state}`
                  : "Nationwide"}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={18}
                  color={PRIMARY_COLOR}
                />
              </View>
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>
                {contractor.experience || 1}+ Years
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}
              >
                <Icon name="people" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Team Size</Text>
              <Text style={styles.statValue}>
                {contractor.teamSize || "1-5"}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIcon, { backgroundColor: LIGHT_PRIMARY }]}
              >
                <Icon name="check-circle" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.statLabel}>Projects Done</Text>
              <Text style={styles.statValue}>
                {contractor.projectsCompleted || 0}
              </Text>
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
                <View
                  style={[
                    styles.licenseCard,
                    {
                      backgroundColor: LIGHT_PRIMARY,
                      borderColor: PRIMARY_COLOR,
                    },
                  ]}
                >
                  <View style={styles.licenseRow}>
                    <Text style={styles.licenseLabel}>License Number</Text>
                    {contractor.isVerified && (
                      <View
                        style={[
                          styles.verifiedBadge,
                          { backgroundColor: "#10B981" },
                        ]}
                      >
                        <Icon name="verified" size={16} color="#FFFFFF" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.licenseNumber}>
                    {contractor.licenseNumber}
                  </Text>
                </View>
              </View>
            )}

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="medal"
                    size={22}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.sectionTitle}>Specialties</Text>
                </View>
                <View style={styles.specialtiesContainer}>
                  {contractor.specialties.map((spec, index) => (
                    <View
                      key={index}
                      style={[
                        styles.specialtyTag,
                        {
                          backgroundColor: LIGHT_PRIMARY,
                          borderColor: PRIMARY_COLOR,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.specialtyText, { color: PRIMARY_COLOR }]}
                      >
                        {spec}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Portfolio Section */}
            {contractor.portfolio && contractor.portfolio.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="briefcase-check"
                    size={22}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.sectionTitle}>
                    Portfolio ({contractor.portfolio.length} Projects)
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.portfolioScroll}
                  contentContainerStyle={styles.portfolioContainer}
                >
                  {contractor.portfolio
                    .slice(0, 5)
                    .map((project, index) => renderProjectCard(project, index))}
                </ScrollView>
                {contractor.portfolio.length > 5 && (
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text
                      style={[styles.viewAllText, { color: PRIMARY_COLOR }]}
                    >
                      View all {contractor.portfolio.length} projects
                    </Text>
                    <Icon
                      name="arrow-forward"
                      size={20}
                      color={PRIMARY_COLOR}
                    />
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
                    onPress={() => handleContractorWebsite(contractor.website)}
                  >
                    <Icon name="language" size={20} color={PRIMARY_COLOR} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Website</Text>
                      <Text
                        style={[styles.infoValue, { color: PRIMARY_COLOR }]}
                        numberOfLines={1}
                      >
                        {contractor.website
                          .replace(/^https?:\/\//, "")
                          .replace(/^www\./, "")}
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

              {/* Banking Information (Public info only) */}
              {contractor.bankDetails && (
                <View
                  style={[
                    styles.bankingCard,
                    {
                      backgroundColor: LIGHT_PRIMARY,
                      borderColor: PRIMARY_COLOR,
                    },
                  ]}
                >
                  <Text style={[styles.bankingTitle, { color: PRIMARY_COLOR }]}>
                    Banking Information (Verified)
                  </Text>
                  <View style={styles.bankingGrid}>
                    {contractor.bankDetails.bankName && (
                      <View style={styles.bankingItem}>
                        <Text style={styles.bankingLabel}>Bank Name</Text>
                        <Text style={styles.bankingValue}>
                          {contractor.bankDetails.bankName}
                        </Text>
                      </View>
                    )}
                    {contractor.bankDetails.ifscCode && (
                      <View style={styles.bankingItem}>
                        <Text style={styles.bankingLabel}>IFSC Code</Text>
                        <Text style={[styles.bankingValue, styles.monoText]}>
                          {contractor.bankDetails.ifscCode}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Ratings & Reviews */}
            {contractor.ratings && contractor.ratings.count > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="star" size={22} color={PRIMARY_COLOR} />
                  <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                </View>
                <View style={styles.ratingsContainer}>
                  <View style={styles.ratingOverview}>
                    <Text style={styles.ratingNumber}>
                      {contractor.ratings.average?.toFixed(1) || "0.0"}
                    </Text>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name={
                            star <= (contractor.ratings.average || 0)
                              ? "star"
                              : "star-border"
                          }
                          size={24}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingCount}>
                      {contractor.ratings.count || 0} reviews
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Your Company Info Footer */}
            <View
              style={[styles.companyFooter, { backgroundColor: LIGHT_PRIMARY }]}
            >
              <Icon name="business" size={30} color={PRIMARY_COLOR} />
              <Text
                style={[styles.companyFooterTitle, { color: PRIMARY_COLOR }]}
              >
                {COMPANY_CONTACT.companyName}
              </Text>
              <Text style={styles.companyFooterText}>
                All contractor communications are managed through our secure
                platform to ensure quality and safety.
              </Text>
              <Text style={styles.companyFooterAddress}>
                {COMPANY_CONTACT.address}
              </Text>
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
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(128, 0, 0, 0.2)",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(128, 0, 0, 0.2)",
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: "bold",
    color: "rgb(128, 0, 0)",
  },
  companyInfo: {
    alignItems: "center",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 12,
  },
  contractorTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contractorTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactSection: {
    marginBottom: 24,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contactCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactCardSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  statItem: {
    width: "50%",
    alignItems: "center",
    paddingVertical: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  sectionsContainer: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },
  licenseCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  licenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  licenseLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  licenseNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "monospace",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "500",
  },
  portfolioScroll: {
    marginHorizontal: -20,
  },
  portfolioContainer: {
    paddingHorizontal: 20,
  },
  portfolioItem: {
    width: width * 0.7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: 150,
  },
  projectImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  projectImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
  },
  projectInfo: {
    padding: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  projectStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectStatusText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  projectBudget: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  additionalInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    minWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
    color: "#64748B",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  bankingCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  bankingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  bankingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bankingItem: {
    flex: 1,
    minWidth: "48%",
    marginRight: 12,
    marginBottom: 12,
  },
  bankingLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  bankingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  monoText: {
    fontFamily: "monospace",
  },
  ratingsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
  },
  ratingOverview: {
    alignItems: "center",
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1E293B",
  },
  ratingStars: {
    flexDirection: "row",
    marginVertical: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "#64748B",
  },
  companyFooter: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
  },
  companyFooterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  companyFooterText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  companyFooterAddress: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#DC2626",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerSpacing: {
    height: 40,
  },
});

export default ContractorDetail;
