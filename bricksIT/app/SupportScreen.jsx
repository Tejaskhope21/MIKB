import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const HelpSupportScreen = () => {
  const router = useRouter();

  const contactOptions = [
    {
      id: 1,
      title: 'Customer Care',
      number: '1800-123-4567',
      icon: 'headset-outline',
      description: 'Available 24/7 for order support',
    },
    {
      id: 2,
      title: 'Sales Enquiry',
      number: '1800-987-6543',
      icon: 'call-outline',
      description: 'For product and pricing queries',
    },
    {
      id: 3,
      title: 'WhatsApp Support',
      number: '+91 98765 43210',
      icon: 'logo-whatsapp',
      description: 'Quick chat support',
    },
    {
      id: 4,
      title: 'Email Support',
      number: 'support@bricksit.com',
      icon: 'mail-outline',
      description: 'Write to us anytime',
    },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How can I track my order?',
      answer: 'Go to My Orders section and click on your order to see tracking details.',
    },
    {
      id: 2,
      question: 'What is the delivery time?',
      answer: 'Standard delivery takes 5-7 business days. Express delivery available in selected areas.',
    },
    {
      id: 3,
      question: 'Can I modify my order after placing it?',
      answer: 'Orders can be modified within 1 hour of placement. Contact support for assistance.',
    },
    {
      id: 4,
      question: 'What is your return policy?',
      answer: 'We offer 30-day return policy for unused items in original packaging.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>
            Get in touch with our support team
          </Text>
          
          {contactOptions.map((option) => (
            <View key={option.id} style={styles.contactCard}>
              <View style={styles.contactIconContainer}>
                <Icon name={option.icon} size={24} color="#800000" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactNumber}>{option.number}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="call-outline" size={20} color="#800000" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <Icon name="warning-outline" size={30} color="#dc2626" />
          <Text style={styles.emergencyTitle}>Emergency Support</Text>
          <Text style={styles.emergencyNumber}>+91 98765 43210</Text>
          <Text style={styles.emergencyText}>
            Available 24/7 for urgent order-related issues
          </Text>
        </View>

        {/* Business Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.hoursTitle}>Business Hours</Text>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Friday</Text>
            <Text style={styles.hoursTime}>9:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Saturday - Sunday</Text>
            <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#800000',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fce7e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emergencySection: {
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 12,
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  hoursSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hoursDay: {
    fontSize: 16,
    color: '#666',
  },
  hoursTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default HelpSupportScreen;