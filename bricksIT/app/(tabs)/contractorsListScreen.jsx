import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
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

const PRIMARY_COLOR = 'rgb(128, 0, 0)';
const SECONDARY_COLOR = '#F8F0F0';

const API_BASE = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

const ContractorsListScreen = () => {
  const navigation = useNavigation();

  const [contractors, setContractors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  // ================= FETCH CONTRACTORS =================
  const fetchContractors = async (loadMore = false, searchText = search) => {
    if (loadMore && !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    if (!loadMore) setLoading(true);

    try {
      let url = `${API_BASE}/contractor-search?page=${currentPage}&limit=10`;

      if (searchText.trim()) {
        url += `&q=${encodeURIComponent(searchText.trim())}`;
      }

      const res = await axios.get(url);
      const newContractors = res.data.contractors || [];

      if (loadMore) {
        setContractors(prev => [...prev, ...newContractors]);
        setPage(currentPage);
      } else {
        setContractors(newContractors);
        setPage(1);
      }

      setHasMore(currentPage < res.data.pages);
    } catch (err) {
      console.error('Contractor fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= FETCH SUGGESTIONS =================
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE}/contractor-search/contractor-suggestions?q=${encodeURIComponent(text)}`
      );
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('Suggestion error:', err);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  // ================= SEARCH HANDLER =================
  const handleSearchChange = (text) => {
    setSearch(text);

    // debounce search
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchContractors(false, text);
    }, 500);

    // debounce suggestions
    clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSuggestionPress = (value) => {
    setSearch(value);
    setSuggestions([]);
    fetchContractors(false, value);
  };

  const clearSearch = () => {
    setSearch('');
    setSuggestions([]);
    fetchContractors(false, '');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContractors();
  };

  const loadMore = () => {
    if (!loading && hasMore) fetchContractors(true);
  };

  // ================= RENDER HEADER =================
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Find Trusted Contractors</Text>
        <Text style={styles.headerSubtitle}>
          Browse verified professionals for your next project
        </Text>
      </View>
    </View>
  );

 

  // ================= RENDER ITEM =================
  const renderContractorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contractorCard}
      onPress={() => navigation.navigate('ContractorDetail', { id: item._id })}
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
          <Text style={styles.description} numberOfLines={1}>
            {item.contractorType || 'Professional contractor'}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={14} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address?.city && item.address?.state
              ? `${item.address.city}, ${item.address.state}`
              : 'Location not listed'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="work" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.experience || 0} years experience
          </Text>
        </View>

       

        {item.portfolio && item.portfolio.length > 0 && (
          <View style={styles.portfolioRow}>
            <Icon name="photo-library" size={14} color={PRIMARY_COLOR} />
            <Text style={styles.portfolioText}>
              {item.portfolio.length} portfolio projects
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // ================= RENDER LOADING =================
  if (loading && contractors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading contractors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />
      {renderHeader()}
      
      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contractors..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          onSubmitEditing={() => fetchContractors(false, search)}
        />
        {search ? (
          <TouchableOpacity onPress={clearSearch}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* SUGGESTIONS */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(item)}
            >
              <Icon name="search" size={16} color="#666" />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CONTRACTOR LIST */}
      <FlatList
        data={contractors}
        keyExtractor={(item) => item._id}
        renderItem={renderContractorItem}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
        onScroll={() => setSuggestions([])}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color="#CCC" />
            <Text style={styles.emptyTitle}>No contractors found</Text>
            <Text style={styles.emptyText}>
              Try changing your search terms
            </Text>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearSearch}
            >
              <Text style={styles.clearFiltersText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          loading && contractors.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
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
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
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
  suggestionBox: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#444',
  },
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
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardDetails: {
    // Details container
  },
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
  reviewText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    marginLeft: 12,
    fontWeight: '500',
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
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: PRIMARY_COLOR,
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
    color: PRIMARY_COLOR,
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