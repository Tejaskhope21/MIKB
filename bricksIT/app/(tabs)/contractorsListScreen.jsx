import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// API configuration for React Native
const API_BASE = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api'
});

const ContractorsListScreen = () => {
  const navigation = useNavigation();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters state (removed locationFilter)
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPortfolio, setWithPortfolio] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter options (removed cities and states)
  const [filterOptions, setFilterOptions] = useState({
    specialties: [],
  });

  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // Ref for search timeout
  const searchTimeoutRef = useRef(null);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/contractor/filter/options`);
      setFilterOptions(res.data.options || { specialties: [] });
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Fetch contractors
  const fetchContractors = async (loadMore = false) => {
    if (loadMore && !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    if (!loadMore) {
      setLoading(true);
    }

    try {
      let url = `${API_BASE}/contractor/?page=${currentPage}&limit=10`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (ratingFilter) url += `&minRating=${ratingFilter}`;
      if (experienceFilter) url += `&minExperience=${experienceFilter}`;
      if (specialtyFilter) url += `&specialty=${encodeURIComponent(specialtyFilter)}`;
      if (verifiedOnly) url += `&verified=true`;
      if (withPortfolio) url += `&withPortfolio=true`;

      const res = await axios.get(url);
      const newContractors = res.data.data || [];

      if (loadMore) {
        setContractors(prev => [...prev, ...newContractors]);
        setPage(currentPage);
      } else {
        setContractors(newContractors);
        setPage(1);
      }

      setTotalPages(res.data.pages || 1);
      setHasMore(currentPage < (res.data.pages || 1));
    } catch (err) {
      setError('Failed to load contractors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
    fetchContractors();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchContractors();
  };

  // Handle load more
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchContractors(true);
    }
  };

  // Handle search with debounce
  const handleSearch = (text) => {
    setSearch(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      fetchContractors();
    }, 500);
  };

  // Render stars (removed review text)
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

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setRatingFilter('');
    setExperienceFilter('');
    setSpecialtyFilter('');
    setVerifiedOnly(false);
    setWithPortfolio(false);
    setPage(1);
    fetchContractors();
    setShowFilters(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPage(1);
    fetchContractors();
    setShowFilters(false);
  };

  // Handle contractor card press - Navigate to contractor profile
  const handleContractorPress = (contractorId) => {
    navigation.navigate('ContractorProfile', { id: contractorId });
  };

  // Render contractor item (removed location row)
  const renderContractorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contractorCard}
      onPress={() => handleContractorPress(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.logoText}>
            {item.companyName?.charAt(0) || 'C'}
          </Text>
        </View>
        <View style={styles.companyInfo}>
          <View style={styles.companyNameRow}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.companyName}
            </Text>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={14} color="#10B981" />
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'Professional contractor services'}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="work" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.experience || 0} years experience
          </Text>
        </View>

        <View style={styles.detailRow}>
          {renderStars(item.rating || 0)}
        </View>

        {item.portfolio && item.portfolio.length > 0 && (
          <View style={styles.portfolioRow}>
            <Icon name="photo-library" size={14} color="#800000" />
            <Text style={styles.portfolioText}>
              {item.portfolio.length} portfolio projects
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render filter modal (removed location filter section)
  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterPanel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity 
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Search</Text>
            <View style={styles.inputContainer}>
              <Icon name="search" size={18} color="#666" />
              <TextInput
                style={styles.input}
                value={search}
                onChangeText={handleSearch}
                placeholder="Company name, description..."
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Rating</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              {['', '4', '4.5', '4.8'].map((rating) => (
                <TouchableOpacity
                  key={rating || 'any'}
                  style={[
                    styles.filterOption,
                    ratingFilter === rating && styles.filterOptionSelected
                  ]}
                  onPress={() => setRatingFilter(rating)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    ratingFilter === rating && styles.filterOptionTextSelected
                  ]}>
                    {rating ? `${rating}+` : 'Any'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Experience</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              {['', '5', '10', '15'].map((exp) => (
                <TouchableOpacity
                  key={exp || 'any'}
                  style={[
                    styles.filterOption,
                    experienceFilter === exp && styles.filterOptionSelected
                  ]}
                  onPress={() => setExperienceFilter(exp)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    experienceFilter === exp && styles.filterOptionTextSelected
                  ]}>
                    {exp ? `${exp}+ yrs` : 'Any'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Specialty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  !specialtyFilter && styles.filterOptionSelected
                ]}
                onPress={() => setSpecialtyFilter('')}
              >
                <Text style={[
                  styles.filterOptionText,
                  !specialtyFilter && styles.filterOptionTextSelected
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {filterOptions.specialties?.slice(0, 10).map((spec) => (
                <TouchableOpacity
                  key={spec._id}
                  style={[
                    styles.filterOption,
                    specialtyFilter === spec._id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSpecialtyFilter(spec._id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    specialtyFilter === spec._id && styles.filterOptionTextSelected
                  ]} numberOfLines={1}>
                    {spec._id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.checkboxSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
            >
              <View style={[
                styles.checkbox,
                verifiedOnly && styles.checkboxChecked
              ]}>
                {verifiedOnly && <Icon name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Verified Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setWithPortfolio(!withPortfolio)}
            >
              <View style={[
                styles.checkbox,
                withPortfolio && styles.checkboxChecked
              ]}>
                {withPortfolio && <Icon name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Has Portfolio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  // Render header with back button
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Find Trusted Contractors</Text>
        <Text style={styles.headerSubtitle}>
          Browse verified professionals for your next project
        </Text>
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Icon name="tune" size={22} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  // Render loading
  if (loading && contractors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading contractors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error
  if (error && contractors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#800000" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchContractors}
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
      {renderHeader()}
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contractors..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
          onSubmitEditing={fetchContractors}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showFilters && renderFilters()}

      <FlatList
        data={contractors}
        renderItem={renderContractorItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#800000']}
            tintColor="#800000"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color="#CCC" />
            <Text style={styles.emptyTitle}>No contractors found</Text>
            <Text style={styles.emptyText}>
              Try changing your filters or search terms
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          loading && contractors.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#800000" />
            </View>
          ) : hasMore && contractors.length > 0 ? (
            <TouchableOpacity onPress={loadMore} style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : contractors.length > 0 ? (
            <Text style={styles.endText}>No more contractors to load</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header with back button
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800000',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 20,
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
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  // Filter Modal
  filterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  filterPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginTop: 20,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    height: '100%',
  },
  scrollOptions: {
    marginHorizontal: -5,
  },
  filterOption: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterOptionSelected: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#555',
  },
  filterOptionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  checkboxSection: {
    marginTop: 25,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#800000',
    borderColor: '#800000',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#444',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#800000',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Contractor List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  contractorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 15,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#800000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardDetails: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 8,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  portfolioText: {
    fontSize: 13,
    color: '#800000',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Loading States
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  clearFiltersButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: '#800000',
    borderRadius: 12,
  },
  clearFiltersText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 25,
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  loadMoreText: {
    fontSize: 16,
    color: '#800000',
    fontWeight: '600',
  },
  endText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 25,
    fontStyle: 'italic',
  },
});

export default ContractorsListScreen;