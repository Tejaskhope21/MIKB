import React, { useState, useEffect, useRef } from "react";
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
  Image,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const PRIMARY_COLOR = "rgb(128, 0, 0)";
const SECONDARY_COLOR = "#F8F0F0";

const STORAGE_KEYS = {
  CONTRACTORS_CACHE: "@contractors_cache",
  CACHE_TIMESTAMP: "@contractors_cache_timestamp",
  SEARCH_HISTORY: "@contractors_search_history",
};

const CACHE_DURATION = 30 * 60 * 1000;

const API_BASE = "http://localhost:5000/api";

const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return instance;
};

const ContractorsListScreen = () => {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking...");
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const api = useRef(createApiInstance());

  // Add a key for FlatList to force fresh render
  const flatListKey = useRef(`flatlist-${Date.now()}`);

  const saveToCache = async (data, searchQuery = "") => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        searchQuery,
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONTRACTORS_CACHE,
        JSON.stringify(cacheData),
      );
    } catch (error) {
      console.error("Error saving to cache");
    }
  };

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CONTRACTORS_CACHE);
      if (cached) {
        const { data, timestamp, searchQuery } = JSON.parse(cached);

        const isCacheValid = Date.now() - timestamp < CACHE_DURATION;

        if (isCacheValid) {
          setIsUsingCache(true);
          return { data, searchQuery };
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.CONTRACTORS_CACHE);
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading from cache");
      return null;
    }
  };

  const saveSearchHistory = async (query) => {
    if (!query.trim()) return;

    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      let historyArray = history ? JSON.parse(history) : [];

      historyArray = historyArray.filter((item) => item !== query);
      historyArray.unshift(query);
      historyArray = historyArray.slice(0, 10);

      await AsyncStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(historyArray),
      );
      setSearchHistory(historyArray);
    } catch (error) {
      console.error("Error saving search history");
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading search history");
    }
  };

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing search history");
    }
  };

  const fetchContractors = async (loadMore = false, searchText = search) => {
    if (loadMore && !hasMore) return;

    const currentPage = loadMore ? page + 1 : 1;
    if (!loadMore) setLoading(true);

    setError(null);
    setIsUsingCache(false);

    try {
      if (!loadMore && !searchText.trim()) {
        const cached = await loadFromCache();
        if (cached) {
          setContractors(cached.data);
          setPage(1);
          setHasMore(false);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      let url = `/contractor-search?page=${currentPage}&limit=10`;

      if (searchText.trim()) {
        url += `&q=${encodeURIComponent(searchText.trim())}`;
        saveSearchHistory(searchText.trim());
      }

      const res = await api.current.get(url);

      const newContractors = res.data.contractors || res.data || [];

      if (loadMore) {
        setContractors((prev) => [...prev, ...newContractors]);
        setPage(currentPage);
      } else {
        setContractors(newContractors);
        setPage(1);

        if (!searchText.trim()) {
          saveToCache(newContractors);
        }
      }

      if (res.data.pages !== undefined) {
        setHasMore(currentPage < res.data.pages);
      } else {
        setHasMore(newContractors.length >= 10);
      }

      setApiStatus("connected");
    } catch (err) {
      if (!loadMore && !searchText.trim()) {
        const cached = await loadFromCache();
        if (cached) {
          setContractors(cached.data);
          setPage(1);
          setHasMore(false);
          setApiStatus("using cached data");
          setIsUsingCache(true);
          setError("Using cached data. Check your internet connection.");
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      let errorMessage = err.message || "Failed to load contractors";

      if (
        errorMessage.includes("Network Error") ||
        errorMessage.includes("network")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage =
          "Request timeout. The server is taking too long to respond.";
      }

      setError(errorMessage);
      setApiStatus("disconnected");

      if (__DEV__ && contractors.length === 0 && !loadMore) {
        const demoData = getDemoData();
        setContractors(demoData);
        setHasMore(false);
        setApiStatus("demo mode");
        setIsUsingCache(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDemoData = () => [
    {
      _id: "1",
      companyName: "Quality Builders Inc.",
      contractorType: "General Contractor",
      address: { city: "New York", state: "NY" },
      experience: 12,
      portfolio: ["project1", "project2", "project3"],
      isVerified: true,
      description: "Professional construction services",
    },
    {
      _id: "2",
      companyName: "Elite Renovations LLC",
      contractorType: "Renovation Specialist",
      address: { city: "Los Angeles", state: "CA" },
      experience: 8,
      portfolio: ["project1"],
      isVerified: false,
      description: "Home renovation experts",
    },
    {
      _id: "3",
      companyName: "Master Electricians Co.",
      contractorType: "Electrical Contractor",
      address: { city: "Chicago", state: "IL" },
      experience: 15,
      portfolio: ["project1", "project2", "project3", "project4"],
      isVerified: true,
      description: "Licensed electrical services",
    },
    {
      _id: "4",
      companyName: "Precision Plumbing",
      contractorType: "Plumbing Contractor",
      address: { city: "Houston", state: "TX" },
      experience: 10,
      portfolio: ["project1", "project2"],
      isVerified: true,
      description: "24/7 plumbing services",
    },
    {
      _id: "5",
      companyName: "Modern Design Build",
      contractorType: "Design-Build Firm",
      address: { city: "Miami", state: "FL" },
      experience: 7,
      portfolio: ["project1"],
      isVerified: false,
      description: "Architectural design and construction",
    },
  ];

  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      if (searchHistory.length > 0) {
        setSuggestions(
          searchHistory.map((item) => ({ type: "history", value: item })),
        );
      } else {
        setSuggestions([]);
      }
      return;
    }

    try {
      const res = await api.current.get(
        `/contractor-search/contractor-suggestions?q=${encodeURIComponent(text)}`,
      );

      const apiSuggestions = res.data || [];
      const historySuggestions = searchHistory
        .filter((item) => item.toLowerCase().includes(text.toLowerCase()))
        .map((item) => ({ type: "history", value: item }));

      const combined = [
        ...historySuggestions,
        ...apiSuggestions.map((item) => ({ type: "api", value: item })),
      ];

      setSuggestions(combined.slice(0, 10));
    } catch (err) {
      const filteredHistory = searchHistory
        .filter((item) => item.toLowerCase().includes(text.toLowerCase()))
        .map((item) => ({ type: "history", value: item }));
      setSuggestions(filteredHistory.slice(0, 5));
    }
  };

  useEffect(() => {
    loadSearchHistory();
    fetchContractors();
  }, []);

  const handleSearchChange = (text) => {
    setSearch(text);

    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchContractors(false, text);
    }, 500);

    clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSuggestionPress = (suggestion) => {
    setSearch(suggestion.value);
    setSuggestions([]);
    fetchContractors(false, suggestion.value);
  };

  const handleHistoryClear = () => {
    Alert.alert(
      "Clear Search History",
      "Are you sure you want to clear your search history?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", onPress: clearSearchHistory, style: "destructive" },
      ],
    );
  };

  const clearSearch = () => {
    setSearch("");
    setSuggestions([]);
    fetchContractors(false, "");
  };

  const onRefresh = () => {
    setRefreshing(true);
    AsyncStorage.removeItem(STORAGE_KEYS.CONTRACTORS_CACHE).then(() => {
      setIsUsingCache(false);
      fetchContractors();
    });
  };

  const loadMore = () => {
    if (!loading && hasMore && !isUsingCache) {
      fetchContractors(true);
    }
  };

  const handleContractorPress = (contractor) => {
    router.push({
      pathname: "/ContractorDetail",
      params: { id: contractor._id, name: contractor.companyName },
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Find Trusted Contractors</Text>
        </View>
        <View
          style={[styles.apiStatusBadge, isUsingCache && styles.cacheBadge]}
        >
          <Text style={styles.apiStatusText}>
            {isUsingCache ? "Cached" : apiStatus}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContractorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleContractorPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContainer}>
        {isUsingCache && (
          <View style={styles.cacheIndicator}>
            <Icon name="wifi-off" size={10} color="#666" />
            <Text style={styles.cacheIndicatorText}>Offline</Text>
          </View>
        )}

        <View style={styles.companyLogo}>
          <Text style={styles.logoText}>
            {item.companyName?.charAt(0)?.toUpperCase() || "C"}
          </Text>
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.companyName || "Contractor"}
          </Text>

          <View style={styles.badgeContainer}>
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={12} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.contractorType} numberOfLines={1}>
          {item.contractorType || "Professional contractor"}
        </Text>

        <View style={styles.detailRow}>
          <Icon name="location-on" size={12} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address?.city && item.address?.state
              ? `${item.address.city}, ${item.address.state}`
              : "Location not listed"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="work" size={12} color="#666" />
          <Text style={styles.detailText}>{item.experience || 0} years</Text>
        </View>

        {item.portfolio && item.portfolio.length > 0 && (
          <View style={styles.portfolioRow}>
            <Icon name="photo-library" size={12} color={PRIMARY_COLOR} />
            <Text style={styles.portfolioText}>
              {item.portfolio.length} projects
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="wifi-off" size={60} color="#dc3545" />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorText}>{error}</Text>

      <View style={styles.troubleshootBox}>
        <Text style={styles.troubleshootTitle}>Troubleshooting:</Text>
        <Text style={styles.troubleshootText}>
          • Check your internet connection
        </Text>
        <Text style={styles.troubleshootText}>• Disable VPN if using one</Text>
        <Text style={styles.troubleshootText}>
          • Try switching between WiFi and mobile data
        </Text>
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchContractors()}
      >
        <Icon name="refresh" size={20} color="#FFF" />
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>

      {isUsingCache && (
        <Text style={styles.cacheNotice}>
          Currently showing cached data. New data will load when connected.
        </Text>
      )}
    </View>
  );

  const renderSuggestionItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Icon
        name={item.type === "history" ? "history" : "search"}
        size={16}
        color={item.type === "history" ? PRIMARY_COLOR : "#666"}
      />
      <Text
        style={[
          styles.suggestionText,
          item.type === "history" && styles.historySuggestionText,
        ]}
      >
        {item.value}
      </Text>
      {item.type === "history" && (
        <Text style={styles.suggestionTypeText}>Past search</Text>
      )}
    </TouchableOpacity>
  );

  if (loading && contractors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading contractors...</Text>
          <Text style={styles.apiInfo}>API Status: {apiStatus}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />
      {renderHeader()}

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
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {search.trim() === "" && searchHistory.length > 0 && (
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionHeaderText}>Recent Searches</Text>
              <TouchableOpacity onPress={handleHistoryClear}>
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
          {suggestions.map(renderSuggestionItem)}
        </View>
      )}

      {error && !loading && contractors.length === 0 && renderError()}

      {!error && (
        <FlatList
          key={flatListKey.current} // Add unique key to force fresh render
          data={contractors}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderContractorItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          onEndReached={!isUsingCache ? loadMore : undefined}
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
            !loading &&
            !error && (
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={60} color="#CCC" />
                <Text style={styles.emptyTitle}>No contractors found</Text>
                <Text style={styles.emptyText}>
                  {search.trim()
                    ? "Try different search terms"
                    : "Check your connection or pull to refresh"}
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearSearch}
                >
                  <Text style={styles.clearFiltersText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={
            loading && contractors.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
              </View>
            ) : hasMore && contractors.length > 0 && !isUsingCache ? (
              <TouchableOpacity
                onPress={loadMore}
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : contractors.length > 0 ? (
              <Text style={styles.endText}>
                {isUsingCache
                  ? "Cached data - pull to refresh"
                  : "No more contractors to load"}
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: 15,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  apiStatusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 10,
  },
  cacheBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.3)",
  },
  apiStatusText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 4,
    shadowColor: "#000",
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
    color: "#333",
    height: "100%",
  },
  clearButton: {
    padding: 4,
  },
  suggestionBox: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 100,
    maxHeight: 300,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  suggestionHeaderText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  clearHistoryText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: "500",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#444",
  },
  historySuggestionText: {
    color: PRIMARY_COLOR,
    fontWeight: "500",
  },
  suggestionTypeText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
  },
  gridContent: {
    paddingBottom: 30,
    paddingTop: 10,
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  cardContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 220,
    position: "relative",
  },
  cacheIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  cacheIndicatorText: {
    fontSize: 9,
    color: "#666",
    marginLeft: 3,
    fontWeight: "500",
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    flex: 1,
  },
  badgeContainer: {
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 9,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 2,
  },
  contractorType: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 11,
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },
  portfolioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  portfolioText: {
    fontSize: 11,
    color: PRIMARY_COLOR,
    marginLeft: 6,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  apiInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  troubleshootBox: {
    backgroundColor: "rgba(220, 53, 69, 0.05)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 10,
  },
  troubleshootText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    width: "80%",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  cacheNotice: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  clearFiltersButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 25,
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  loadMoreText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },
  endText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginVertical: 25,
    fontStyle: "italic",
  },
});

export default ContractorsListScreen;
