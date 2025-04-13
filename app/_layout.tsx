import { TamaguiProvider } from "tamagui";
import { Tabs } from "expo-router";
import config from "./../tamagui.config";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
   return (
      <TamaguiProvider config={config}>
         <Tabs
            screenOptions={{
               tabBarActiveTintColor: "#2563eb",
               headerShown: false,
            }}
         >
            {/* Home (Landing Page) */}
            <Tabs.Screen
               name="index"
               options={{
                  title: "Home",
                  tabBarIcon: ({ color }) => (
                     <Ionicons name="home" size={24} color={color} />
                  ),
               }}
            />

            {/* Community Tab */}
            <Tabs.Screen
               name="community"
               options={{
                  title: "Community",
                  tabBarIcon: ({ color }) => (
                     <Ionicons name="people" size={24} color={color} />
                  ),
               }}
            />

            {/* Report Tab */}
            <Tabs.Screen
               name="report"
               options={{
                  title: "Report",
                  tabBarIcon: ({ color }) => (
                     <Ionicons name="alert-circle" size={24} color={color} />
                  ),
               }}
            />

            {/* Profile Tab */}
            <Tabs.Screen
               name="profile"
               options={{
                  title: "Profile",
                  tabBarIcon: ({ color }) => (
                     <Ionicons name="person" size={24} color={color} />
                  ),
               }}
            />
         </Tabs>
      </TamaguiProvider>
   );
}
