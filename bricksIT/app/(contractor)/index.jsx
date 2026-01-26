import { Text, ScrollView } from 'react-native';
import { useEffect } from 'react';
// import { useContractor } from '../context/ContractorContext';

export default function ContractorDashboard() {
  

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
        Contractor Dashboard
      </Text>

      <Text>Total Projects: </Text>
      <Text>Profile Views: </Text>
      <Text>Portfolio Views: </Text>
    </ScrollView>
  );
}
