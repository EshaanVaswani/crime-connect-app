import {
   View,
   Text,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
   const [phoneNumber, setPhoneNumber] = useState("");
   const [countryCode, setCountryCode] = useState("+1");
   const router = useRouter();

   const handleSendOTP = () => {
      // Here you would validate and make API call to send OTP
      // For now, just navigate to OTP screen
      router.push({
         pathname: "/(auth)/otp",
         params: { phone: countryCode + phoneNumber },
      });
   };

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.content}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
               <View style={styles.logo}>
                  <Ionicons name="shield-checkmark" size={60} color="#fff" />
               </View>
               <Text style={styles.appName}>SafeWatch</Text>
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
                     phoneNumber.length < 5 && styles.disabledButton,
                  ]}
                  onPress={handleSendOTP}
                  disabled={phoneNumber.length < 5}
               >
                  <Text style={styles.continueButtonText}>Continue</Text>
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
