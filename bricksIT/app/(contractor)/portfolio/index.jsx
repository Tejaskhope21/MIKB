import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

const API_URL = "http://localhost:5000/api";
const { width } = Dimensions.get("window");

export default function PortfolioScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contractorName, setContractorName] = useState("");
  const [userInitial, setUserInitial] = useState("C");
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    totalRevenue: 0,
  });

  // Modal states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // New project form
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    clientName: "",
    location: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "ongoing",
    category: "Residential",
  });

  // Profile data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    experience: "",
    specialties: [],
  });

  useEffect(() => {
    loadContractorData();
    fetchProjects();
    fetchDashboardStats();
  }, []);

  const loadContractorData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setContractorName(parsedData.name || "Contractor");
        setUserInitial(parsedData.name?.charAt(0).toUpperCase() || "C");
        setProfileData({
          name: parsedData.name || "",
          email: parsedData.email || "",
          phone: parsedData.phone || "",
          companyName: parsedData.companyName || "",
          experience: parsedData.experience || "",
          specialties: parsedData.specialties || [],
        });
      }
    } catch (error) {
      console.error("Error loading contractor data:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/v1/contractor/portfolio/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      Alert.alert("Error", "Failed to load projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/v1/contractor/stats/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setStats(
          response.data.stats || {
            totalProjects: 0,
            completedProjects: 0,
            ongoingProjects: 0,
            totalRevenue: 0,
          },
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
    fetchDashboardStats();
  };

  const handleAddProject = async () => {
    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.clientName
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/v1/contractor/portfolio/projects`,
        newProject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        Alert.alert("Success", "Project added successfully");
        setShowAddProjectModal(false);
        setNewProject({
          title: "",
          description: "",
          clientName: "",
          location: "",
          budget: "",
          startDate: "",
          endDate: "",
          status: "ongoing",
          category: "Residential",
        });
        fetchProjects();
        fetchDashboardStats();
      }
    } catch (error) {
      console.error("Error adding project:", error);
      Alert.alert("Error", "Failed to add project");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/login");
        },
      },
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{contractorName}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationBtn}>
        <Icon name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>Dashboard Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#4F46E5" }]}>
          <Icon name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>{stats.totalProjects}</Text>
          <Text style={styles.statLabel}>Total Projects</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#10B981" }]}>
          <Icon name="checkmark-done-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>{stats.completedProjects}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
          <Icon name="time-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>{stats.ongoingProjects}</Text>
          <Text style={styles.statLabel}>Ongoing</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#EF4444" }]}>
          <Icon name="cash-outline" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </View>
  );

  const renderProjects = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      );
    }

    if (projects.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Icon name="folder-open-outline" size={60} color="#9ca3af" />
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first project
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.projectsGrid}>
        {projects.map((project) => (
          <TouchableOpacity key={project._id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      project.status === "completed" ? "#10B981" : "#F59E0B",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {project.status === "completed" ? "Completed" : "Ongoing"}
                </Text>
              </View>
              <Text style={styles.projectCategory}>{project.category}</Text>
            </View>
            <Text style={styles.projectTitle} numberOfLines={2}>
              {project.title}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={3}>
              {project.description}
            </Text>
            <View style={styles.projectFooter}>
              <View style={styles.clientInfo}>
                <Icon name="person-outline" size={16} color="#6b7280" />
                <Text style={styles.clientName}>{project.clientName}</Text>
              </View>
              <Text style={styles.projectBudget}>
                {formatCurrency(project.budget || 0)}
              </Text>
            </View>
            <View style={styles.projectDates}>
              <Text style={styles.dateText}>
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAddProjectModal = () => (
    <Modal
      visible={showAddProjectModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddProjectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Project</Text>
            <TouchableOpacity onPress={() => setShowAddProjectModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter project title"
                value={newProject.title}
                onChangeText={(text) =>
                  setNewProject({ ...newProject, title: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter project description"
                value={newProject.description}
                onChangeText={(text) =>
                  setNewProject({ ...newProject, description: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Client Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Client name"
                  value={newProject.clientName}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, clientName: text })
                  }
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Budget (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Project budget"
                  value={newProject.budget}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, budget: text })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Project location"
                value={newProject.location}
                onChangeText={(text) =>
                  setNewProject({ ...newProject, location: text })
                }
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newProject.startDate}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, startDate: text })
                  }
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newProject.endDate}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, endDate: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Residential/Commercial"
                  value={newProject.category}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, category: text })
                  }
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Status</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ongoing/completed"
                  value={newProject.status}
                  onChangeText={(text) =>
                    setNewProject({ ...newProject, status: text })
                  }
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddProjectModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleAddProject}
            >
              <Text style={styles.submitButtonText}>Add Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, styles.profileAvatar]}>
                <Text style={styles.avatarText}>{userInitial}</Text>
              </View>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileCompany}>
                {profileData.companyName}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profileData.phone}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>
                {profileData.experience} years
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Specialties</Text>
              <View style={styles.specialtiesContainer}>
                {profileData.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => {
                setShowProfileModal(false);
                router.push("/(contractor)/profile");
              }}
            >
              <Text style={styles.submitButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsBody}>
            <TouchableOpacity style={styles.settingItem}>
              <Icon name="notifications-outline" size={24} color="#4B5563" />
              <Text style={styles.settingText}>Notifications</Text>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Icon name="shield-checkmark-outline" size={24} color="#4B5563" />
              <Text style={styles.settingText}>Privacy & Security</Text>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Icon name="help-circle-outline" size={24} color="#4B5563" />
              <Text style={styles.settingText}>Help & Support</Text>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Icon name="call-outline" size={24} color="#4B5563" />
              <View>
                <Text style={styles.settingText}>Support Number</Text>
                <Text style={styles.supportNumber}>+91-9876543210</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={24} color="#DC2626" />
              <Text style={[styles.settingText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderBottomTabs = () => (
    <View style={styles.bottomTabs}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "projects" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("projects")}
      >
        <Icon
          name="document-text-outline"
          size={24}
          color={activeTab === "projects" ? "#800000" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "projects" && styles.activeTabText,
          ]}
        >
          Projects
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddProjectModal(true)}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "profile" && styles.activeTabButton,
        ]}
        onPress={() => {
          setActiveTab("profile");
          setShowProfileModal(true);
        }}
      >
        <Icon
          name="person-outline"
          size={24}
          color={activeTab === "profile" ? "#800000" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "profile" && styles.activeTabText,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "settings" && styles.activeTabButton,
        ]}
        onPress={() => {
          setActiveTab("settings");
          setShowSettingsModal(true);
        }}
      >
        <Icon
          name="settings-outline"
          size={24}
          color={activeTab === "settings" ? "#800000" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "settings" && styles.activeTabText,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {renderStats()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.projectsHeader}>
            <Text style={styles.sectionTitle}>My Portfolio Projects</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                router.push("/(contractor)/portfolio/all-projects")
              }
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {renderProjects()}
        </View>
      </ScrollView>

      {renderBottomTabs()}
      {renderAddProjectModal()}
      {renderProfileModal()}
      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#800000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  notificationBtn: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: width / 2 - 25,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  projectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#800000",
    borderRadius: 6,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  projectsGrid: {
    gap: 15,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  projectCategory: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clientName: {
    fontSize: 14,
    color: "#4B5563",
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  projectDates: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 5,
    textAlign: "center",
  },
  bottomTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-around",
    position: "relative",
  },
  tabButton: {
    alignItems: "center",
    padding: 10,
    flex: 1,
  },
  activeTabButton: {
    // Active state styling
  },
  tabText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  activeTabText: {
    color: "#800000",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    top: -25,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#800000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalBody: {
    maxHeight: 400,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#800000",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  profileCompany: {
    fontSize: 16,
    color: "#6B7280",
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5,
  },
  specialtyBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    color: "#3730A3",
    fontSize: 12,
  },
  settingsBody: {
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  supportNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  logoutItem: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#DC2626",
  },
});
