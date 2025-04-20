import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import config from "../tamagui.config";
import AuthProvider, { useAuth } from "./contexts/auth-context";

export default function RootLayout() {
   return (
      <AuthProvider>
         <TamaguiProvider config={config}>
            <MainLayout />
         </TamaguiProvider>
      </AuthProvider>
   );
}

function MainLayout() {
   const { authState } = useAuth();
   const router = useRouter();
   const segments = useSegments();

   useEffect(() => {
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";
      const inScreensGroup = segments[0] === "(screens)";

      if (authState.isLoading) return;

      if (authState.isAuthenticated) {
         if (!inTabsGroup && !inScreensGroup) {
            router.replace("/(tabs)");
         }
      } else {
         if (authState.isFirstLaunch && !inAuthGroup) {
            router.replace("/(auth)/onboarding");
         } else if (!authState.isFirstLaunch && !inAuthGroup) {
            router.replace("/(auth)/auth");
         }
      }
   }, [authState, segments]);

   return (
      <>
         <Slot />
         {authState.isLoading && (
            <View style={styles.loadingOverlay}>
               <ActivityIndicator size="large" color="#B71C1C" />
            </View>
         )}
      </>
   );
}

const styles = StyleSheet.create({
   loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.9)",
      justifyContent: "center",
      alignItems: "center",
   },
});
