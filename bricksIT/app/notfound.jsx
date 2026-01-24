// app/not-found.jsx (Alternative with Image)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function NotFoundScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Background Pattern */}
      <View style={styles.patternContainer}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Error Code */}
        <Text style={styles.errorCode}>404</Text>
        
        {/* Error Message */}
        <Text style={styles.title}>Oops! Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved to another location.
        </Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png' }}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* Action Buttons */}
        {/* <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Go to Homepage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#800000" />
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View> */}

        {/* Help Section */}
        {/* <View style={styles.helpSection}>
          <View style={styles.helpIcon}>
            <Ionicons name="help-circle" size={24} color="#800000" />
          </View>
          <Text style={styles.helpTitle}>Can't find what you need?</Text>
          <Text style={styles.helpText}>
            Try searching for products or browse our categories
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={16} color="#fff" />
            <Text style={styles.searchButtonText}>Search Products</Text>
          </TouchableOpacity>
        </View> */}

        {/* Quick Links */}
        {/* <View style={styles.linksContainer}>
          <Text style={styles.linksTitle}>Popular Pages:</Text>
          <View style={styles.linksGrid}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push('/categories')}
            >
              <Ionicons name="grid-outline" size={18} color="#800000" />
              <Text style={styles.linkText}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push('/trending')}
            >
              <Ionicons name="trending-up" size={18} color="#800000" />
              <Text style={styles.linkText}>Trending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push('/hot-deals')}
            >
              <Ionicons name="flame" size={18} color="#800000" />
              <Text style={styles.linkText}>Hot Deals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => router.push('/cart')}
            >
              <Ionicons name="cart" size={18} color="#800000" />
              <Text style={styles.linkText}>Cart</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>BricksIT</Text>
          <Text style={styles.footerText}>Building Materials & Construction Solutions</Text>
          <Text style={styles.footerCopyright}>© 2024 BricksIT. All rights reserved.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  patternContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternCircle1: {
    position: 'absolute',
    top: '10%',
    right: '5%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(128, 0, 0, 0.04)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: '15%',
    left: '8%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(128, 0, 0, 0.03)',
  },
  patternCircle3: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(128, 0, 0, 0.02)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  errorCode: {
    fontSize: 100,
    fontWeight: '900',
    color: 'rgba(128, 0, 0, 0.08)',
    letterSpacing: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    marginVertical: 30,
  },
  illustrationImage: {
    width: 220,
    height: 220,
    opacity: 0.9,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#800000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#800000',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#800000',
    fontSize: 16,
    fontWeight: '700',
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#800000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  linksContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});