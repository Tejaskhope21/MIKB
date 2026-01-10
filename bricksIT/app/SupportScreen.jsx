// app/support.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function SupportScreen() {
  const router = useRouter();
  const SUPPORT_NUMBER = '9022967759';
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const makePhoneCall = () => {
    let phoneNumber = '';
    
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${SUPPORT_NUMBER}`;
    } else {
      phoneNumber = `telprompt:${SUPPORT_NUMBER}`;
    }
    
    Linking.openURL(phoneNumber).catch(err => {
      Alert.alert('Error', 'Unable to make a call');
      console.log('Error making call:', err);
    });
  };

  const sendWhatsAppMessage = () => {
    const url = `whatsapp://send?phone=${SUPPORT_NUMBER}&text=Hello, I need support`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to send a message');
    });
  };

  const copyToClipboard = () => {
    Alert.alert('Copied!', 'Support number copied to clipboard');
  };

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Request Submitted',
      'Our support team will contact you soon. You can also call us directly.',
      [
        { text: 'Call Now', onPress: makePhoneCall },
        { text: 'OK', style: 'default' }
      ]
    );
    
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View style={styles.heroSection}>
        <Ionicons name="help-circle" size={60} color="#800000" />
        <Text style={styles.title}>Support Center</Text>
        <Text style={styles.subtitle}>We're here to help you 24/7</Text>
      </View>

      {/* Support Number Card */}
      <View style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <MaterialIcons name="contact-phone" size={24} color="#800000" />
          <Text style={styles.contactTitle}>Direct Support Line</Text>
        </View>
        
        <View style={styles.numberContainer}>
          <Text style={styles.supportNumber}>{SUPPORT_NUMBER}</Text>
          <Text style={styles.availableText}>Available 24/7</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.callButton} onPress={makePhoneCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.buttonText}>Call Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.whatsappButton} onPress={sendWhatsAppMessage}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Ionicons name="copy" size={18} color="#800000" />
            <Text style={styles.copyButtonText}>Copy Number</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Send us a Message</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="chatbubble" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Describe your issue..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Request</Text>
          <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  numberContainer: {
    alignItems: 'center',
  },
  supportNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#800000',
    marginVertical: 10,
    letterSpacing: 1,
  },
  availableText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#800000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  copyButtonText: {
    color: '#800000',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 30,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#800000',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});