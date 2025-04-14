import React, { useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   Dimensions,
   TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get("window");

const onboardingData: Array<{
   title: string;
   description: string;
   icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
   {
      title: "Report Crimes Easily",
      description: "Quick and anonymous crime reporting at your fingertips",
      icon: "alert-circle-outline",
   },
   {
      title: "Stay Informed",
      description: "Get real-time updates on safety in your community",
      icon: "notifications-outline",
   },
   {
      title: "Build Safer Communities",
      description: "Work together with your neighbors to improve safety",
      icon: "people-outline",
   },
];

// Make sure to use default export
export default function OnboardingScreen() {
   const [activeIndex, setActiveIndex] = useState(0);
   const router = useRouter();

   const finishOnboarding = async () => {
      await AsyncStorage.setItem("hasLaunched", "true");
      router.replace("/(auth)/auth");
   };

   // Simplified version without carousel for troubleshooting
   return (
      <View style={styles.container}>
         <View style={styles.slide}>
            <Ionicons
               name={onboardingData[activeIndex].icon}
               size={80}
               color="#B71C1C"
            />
            <Text style={styles.title}>
               {onboardingData[activeIndex].title}
            </Text>
            <Text style={styles.description}>
               {onboardingData[activeIndex].description}
            </Text>
         </View>

         <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
               <View
                  key={index}
                  style={[
                     styles.paginationDot,
                     {
                        backgroundColor:
                           index === activeIndex ? "#B71C1C" : "#D3D3D3",
                     },
                  ]}
               />
            ))}
         </View>

         <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={finishOnboarding}>
               <Text style={styles.buttonText}>
                  {activeIndex === onboardingData.length - 1
                     ? "Get Started"
                     : "Skip"}
               </Text>
            </TouchableOpacity>

            {activeIndex !== onboardingData.length - 1 && (
               <TouchableOpacity
                  style={[styles.button, styles.nextButton]}
                  onPress={() =>
                     setActiveIndex((prev) =>
                        prev < onboardingData.length - 1 ? prev + 1 : prev
                     )
                  }
               >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>
                     Next
                  </Text>
               </TouchableOpacity>
            )}
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingTop: 50,
   },
   slide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 20,
      textAlign: "center",
      color: "#333",
   },
   description: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 10,
      color: "#666",
      lineHeight: 22,
   },
   pagination: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
   },
   paginationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 5,
   },
   buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 40,
   },
   button: {
      padding: 15,
   },
   buttonText: {
      fontSize: 16,
      color: "#666",
   },
   nextButton: {
      backgroundColor: "#B71C1C",
      borderRadius: 8,
      paddingHorizontal: 30,
   },
   nextButtonText: {
      color: "white",
      fontWeight: "bold",
   },
});
