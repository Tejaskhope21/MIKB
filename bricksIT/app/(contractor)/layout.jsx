import { Stack } from 'expo-router';
// import { ContractorProvider } from '../context/ContractorContext';

export default function ContractorLayout() {
  return (
    <ContractorProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ContractorProvider>
  );
}
