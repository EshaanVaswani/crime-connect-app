import {
   View,
   Text,
   StyleSheet,
   TextInput,
   TouchableOpacity,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext } from "react";
import { AuthContext } from "../_layout";

export default function OTPScreen() {
   const { phone } = useLocalSearchParams();
   const [otp, setOtp] = useState(["", "", "", ""]);
   const [timer, setTimer] = useState(30);
   const inputRefs = [
      useRef<TextInput>(null),
      useRef<TextInput>(null),
      useRef<TextInput>(null),
      useRef<TextInput>(null),
   ];
   const router = useRouter();

   useEffect(() => {
      const interval = setInterval(() => {
         setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
   }, []);

   const handleOtpChange = (text: string, index: number): void => {
      if (text.length <= 1) {
         const newOtp: string[] = [...otp];
         newOtp[index] = text;
         setOtp(newOtp);

         // Auto focus next input
         if (text !== "" && index < 3) {
            if (inputRefs[index + 1].current) {
               inputRefs[index + 1].current?.focus();
            }
         }
      }
   };

   interface KeyPressEvent {
      nativeEvent: {
         key: string;
      };
   }

   const handleKeyPress = (event: KeyPressEvent, index: number): void => {
      if (
         event.nativeEvent.key === "Backspace" &&
         otp[index] === "" &&
         index > 0
      ) {
         inputRefs[index - 1].current?.focus();
      }
   };

   const authContext = useContext(AuthContext);

   if (!authContext) {
      throw new Error(
         "AuthContext is null. Make sure you are using the provider correctly."
      );
   }

   const { signIn } = authContext;

   const handleVerify = async () => {
      // Here you would validate OTP with your backend
      // For demo, just save a mock token and navigate to main app
      try {
         await signIn("demo-token");
         // The router.replace is handled by the useEffect in _layout.js
      } catch (e) {
         console.error("Error signing in:", e);
      }
   };

   const handleResendOTP = () => {
      // Reset timer and would call API to resend OTP
      setTimer(30);
   };

   return (
      <SafeAreaView style={styles.container}>
         <View style={styles.content}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
               We've sent a verification code to {phone}
            </Text>

            <View style={styles.otpContainer}>
               {otp.map((digit, index) => (
                  <TextInput
                     key={index}
                     ref={inputRefs[index]}
                     style={styles.otpInput}
                     value={digit}
                     onChangeText={(text) => handleOtpChange(text, index)}
                     onKeyPress={(e) => handleKeyPress(e, index)}
                     keyboardType="number-pad"
                     maxLength={1}
                  />
               ))}
            </View>

            <TouchableOpacity
               style={[
                  styles.verifyButton,
                  otp.join("").length < 4 && styles.disabledButton,
               ]}
               onPress={handleVerify}
               disabled={otp.join("").length < 4}
            >
               <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
               <Text style={styles.resendText}>Didn't receive code? </Text>
               {timer > 0 ? (
                  <Text style={styles.timerText}>Resend in {timer}s</Text>
               ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                     <Text style={styles.resendActionText}>Resend</Text>
                  </TouchableOpacity>
               )}
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
      paddingTop: 40,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
   },
   subtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 40,
      textAlign: "center",
   },
   otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 40,
   },
   otpInput: {
      width: 60,
      height: 60,
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      textAlign: "center",
      fontSize: 24,
   },
   verifyButton: {
      backgroundColor: "#B71C1C",
      height: 50,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
   },
   disabledButton: {
      backgroundColor: "#DDDDDD",
   },
   verifyButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "bold",
   },
   resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
   },
   resendText: {
      color: "#666",
   },
   timerText: {
      color: "#999",
   },
   resendActionText: {
      color: "#B71C1C",
      fontWeight: "bold",
   },
});
