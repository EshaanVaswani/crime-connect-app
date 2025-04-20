import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
   isLoading: boolean;
   isAuthenticated: boolean;
   isFirstLaunch: boolean | null;
}

interface AuthContextType {
   authState: AuthState;
   signIn: (token: string) => Promise<void>;
   signOut: () => Promise<void>;
   completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
   const [authState, setAuthState] = useState<AuthState>({
      isLoading: true,
      isAuthenticated: false,
      isFirstLaunch: null,
   });

   useEffect(() => {
      const checkAuthState = async () => {
         try {
            const [hasLaunched, userToken] = await Promise.all([
               AsyncStorage.getItem("hasLaunched"),
               AsyncStorage.getItem("userToken"),
            ]);

            setAuthState({
               isLoading: false,
               isAuthenticated: !!userToken,
               isFirstLaunch: hasLaunched !== "true",
            });
         } catch (error) {
            console.error("Auth state check failed:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
         }
      };

      checkAuthState();
   }, []);

   const value = {
      authState,
      signIn: async (token: string) => {
         await AsyncStorage.setItem("userToken", token);
         setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
         }));
      },
      signOut: async () => {
         await AsyncStorage.multiRemove(["userToken", "hasLaunched"]);
         setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isFirstLaunch: true,
         });
      },
      completeOnboarding: async () => {
         await AsyncStorage.setItem("hasLaunched", "true");
         setAuthState((prev) => ({
            ...prev,
            isFirstLaunch: false,
         }));
      },
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};
