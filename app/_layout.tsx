import { useLocationStore } from '@/store/location';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import "./global.css";



export default function RootLayout() {
  const fetchLocation = useLocationStore((s: any) => s.fetchLocation);

  useEffect(() => {
    // ✅ effects can run conditionally, hooks cannot
    fetchLocation();
  }, [fetchLocation]);



  const { colorScheme } = useColorScheme();


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}