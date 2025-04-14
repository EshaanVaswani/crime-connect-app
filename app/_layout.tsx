// app/_layout.js
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import config from "../tamagui.config";

// Create a context provider to manage auth state
import { createContext, Context } from "react";

interface AuthContextType {
   signIn: (token: string) => Promise<void>;
   signOut: () => Promise<void>;
   completeOnboarding: () => Promise<void>;
}

export const AuthContext: Context<AuthContextType | null> =
   createContext<AuthContextType | null>(null);

export default function RootLayout() {
   const [isLoading, setIsLoading] = useState(true);
   const [isFirstLaunch, setIsFirstLaunch] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const router = useRouter();
   const segments = useSegments();

   useEffect(() => {
      // Check if it's the first launch and auth status
      async function checkStatus() {
         try {
            const hasLaunched = await AsyncStorage.getItem("hasLaunched");
            const userToken = await AsyncStorage.getItem("userToken");

            setIsFirstLaunch(hasLaunched === null);
            setIsAuthenticated(userToken !== null);
            setIsLoading(false);
         } catch (e) {
            console.error("Error checking app status:", e);
            setIsLoading(false);
         }
      }

      checkStatus();
   }, []);

   useEffect(() => {
      if (isLoading) return;

      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";

      // Handle routing based on auth state
      if (isAuthenticated && inAuthGroup) {
         // Redirect to tabs if authenticated but in auth group
         router.replace("/(tabs)");
      } else if (!isAuthenticated && inTabsGroup) {
         // Redirect to auth if not authenticated but in tabs group
         if (isFirstLaunch) {
            router.replace("/(auth)/onboarding");
         } else {
            router.replace("/(auth)/auth");
         }
      } else if (!isAuthenticated && !inAuthGroup && !isLoading) {
         // Initial load, not in any group yet
         if (isFirstLaunch) {
            router.replace("/(auth)/onboarding");
         } else {
            router.replace("/(auth)/auth");
         }
      }
   }, [isAuthenticated, isFirstLaunch, isLoading, segments]);

   // For loading state
   if (isLoading) {
      return (
         <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
         >
            <ActivityIndicator size="large" color="#B71C1C" />
         </View>
      );
   }

   const authContext: AuthContextType = {
      signIn: async (token: string) => {
         await AsyncStorage.setItem("userToken", token);
         setIsAuthenticated(true);
      },
      signOut: async () => {
         await AsyncStorage.removeItem("userToken");
         setIsAuthenticated(false);
      },
      completeOnboarding: async () => {
         await AsyncStorage.setItem("hasLaunched", "true");
         setIsFirstLaunch(false);
      },
   };

   // Using Slot for rendering current route
   return (
      <AuthContext.Provider value={authContext}>
         <TamaguiProvider config={config}>
            <Slot />
         </TamaguiProvider>
      </AuthContext.Provider>
   );
}
