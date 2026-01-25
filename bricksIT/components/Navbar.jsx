import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ✅ CORRECT IMAGE IMPORT
import Logo from '../assets/logo.png';

export default function Navbar() {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#800000" />

      <View style={styles.container}>
        {/* LOGO */}
        <TouchableOpacity onPress={() => router.push('/')}>
          <Image
            source={Logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ICONS */}
        <View style={styles.icons}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },

  logo: {
    width: 120,
    height: 42,
  },

  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    marginLeft: 20,
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ffcc00',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
});
