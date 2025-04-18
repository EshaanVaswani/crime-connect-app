import {
   View,
   Text,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   Image,
   ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../_layout";

export default function AuthScreen() {
   const [phoneNumber, setPhoneNumber] = useState("");
   const [countryCode, setCountryCode] = useState("+91");
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   const { signIn } = useAuth();

   const handleSendOTP = async () => {
      try {
         setLoading(true);
         const fullPhone = countryCode + phoneNumber;

         // Validate phone number format
         if (!/^\+?\d{8,15}$/.test(fullPhone)) {
            alert("Please enter a valid phone number");
            return;
         }

         const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ phone: fullPhone }),
            }
         );

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || "Login request failed");
         }

         if (data.success) {
            await signIn(data.token);
            router.replace("/(tabs)");
         }
      } catch (error: any) {
         console.error("Login error:", error);
         let errorMessage = "Login failed. Please try again.";

         if (error.message.includes("Network request failed")) {
            errorMessage = "Network error. Check your connection.";
         } else if (error.message.includes("phone")) {
            errorMessage = "Invalid phone number format";
         }

         alert(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.content}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
               <View style={styles.logo}>
                  <Ionicons name="shield-checkmark" size={60} color="#fff" />
               </View>
               <Text style={styles.appName}>Crime Connect</Text>
               <Text style={styles.tagline}>
                  Report crimes, build safer communities
               </Text>
            </View>

            {/* Authentication Form */}
            <View style={styles.formContainer}>
               <Text style={styles.formTitle}>Enter your phone number</Text>
               <Text style={styles.formSubtitle}>
                  We will send you a verification code
               </Text>

               <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeContainer}>
                     <TextInput
                        style={styles.countryCodeInput}
                        value={countryCode}
                        onChangeText={setCountryCode}
                        keyboardType="phone-pad"
                        maxLength={4}
                     />
                  </View>

                  <TextInput
                     style={styles.phoneInput}
                     value={phoneNumber}
                     onChangeText={setPhoneNumber}
                     placeholder="Phone number"
                     keyboardType="phone-pad"
                     autoFocus
                  />
               </View>

               <TouchableOpacity
                  style={[
                     styles.continueButton,
                     (phoneNumber.length < 5 || loading) &&
                        styles.disabledButton,
                  ]}
                  onPress={handleSendOTP}
                  disabled={phoneNumber.length < 5 || loading}
               >
                  {loading ? (
                     <ActivityIndicator color="#FFF" />
                  ) : (
                     <Text style={styles.continueButtonText}>Continue</Text>
                  )}
               </TouchableOpacity>
               <Text style={styles.termsText}>
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
               </Text>
            </View>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#fff",
   },
   content: {
      flex: 1,
      paddingHorizontal: 20,
   },
   logoContainer: {
      alignItems: "center",
      marginTop: 60,
      marginBottom: 40,
   },
   logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#B71C1C",
      alignItems: "center",
      justifyContent: "center",
   },
   appName: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 12,
      color: "#333",
   },
   tagline: {
      fontSize: 14,
      color: "#666",
      marginTop: 5,
   },
   formContainer: {
      width: "100%",
   },
   formTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#333",
   },
   formSubtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 24,
   },
   phoneInputContainer: {
      flexDirection: "row",
      marginBottom: 20,
   },
   countryCodeContainer: {
      width: 70,
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      marginRight: 10,
      paddingHorizontal: 10,
      justifyContent: "center",
   },
   countryCodeInput: {
      fontSize: 16,
   },
   phoneInput: {
      flex: 1,
      height: 50,
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
   },
   continueButton: {
      backgroundColor: "#B71C1C",
      height: 50,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
   },
   disabledButton: {
      backgroundColor: "#DDDDDD",
   },
   continueButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
   },
   termsText: {
      fontSize: 12,
      color: "#999",
      textAlign: "center",
   },
});
