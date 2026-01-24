import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HelpSupportScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>1234567890</Text>
    </View>
  );
};

export default HelpSupportScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center',     // center horizontally
    backgroundColor: '#fff',
  },
  number: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800000', // maroon color
  },
});
