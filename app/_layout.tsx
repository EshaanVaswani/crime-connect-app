// app/_layout.js
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider } from "tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import config from "../tamagui.config";
import { createContext, useContext } from "react";

interface AuthContextType {
   signIn: (token: string) => Promise<void>;
   signOut: () => Promise<void>;
   completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};

export default function RootLayout() {
   const [isLoading, setIsLoading] = useState(true);
   const [isFirstLaunch, setIsFirstLaunch] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const router = useRouter();
   const segments = useSegments();

   useEffect(() => {
      const checkAuthState = async () => {
         try {
            const [hasLaunched, userToken] = await Promise.all([
               AsyncStorage.getItem("hasLaunched"),
               AsyncStorage.getItem("userToken"),
            ]);

            setIsFirstLaunch(!hasLaunched);
            setIsAuthenticated(!!userToken);
         } catch (error) {
            console.error("Auth state check failed:", error);
         } finally {
            setIsLoading(false);
         }
      };

      checkAuthState();
   }, []);

   useEffect(() => {
      if (!isLoading) {
         const inAuthGroup = segments[0] === "(auth)";
         const inTabsGroup = segments[0] === "(tabs)";

         if (isAuthenticated && !inTabsGroup) {
            router.replace("/(tabs)");
         } else if (!isAuthenticated && !inAuthGroup) {
            router.replace(
               isFirstLaunch ? "/(auth)/onboarding" : "/(auth)/auth"
            );
         }
      }
   }, [isAuthenticated, isLoading, segments]);

   const authContext = {
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

   return (
      <AuthContext.Provider value={authContext}>
         <TamaguiProvider config={config}>
            {/* Always render Slot first */}
            <Slot />

            {/* Loading overlay */}
            {isLoading && (
               <View
                  style={{
                     position: "absolute",
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: "rgba(255,255,255,0.9)",
                     justifyContent: "center",
                     alignItems: "center",
                  }}
               >
                  <ActivityIndicator size="large" color="#B71C1C" />
               </View>
            )}
         </TamaguiProvider>
      </AuthContext.Provider>
   );
}
