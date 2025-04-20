import {
   View,
   Text,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext } from "react";
import { useAuth } from "../contexts/auth-context";

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

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

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

   const { signIn } = useAuth();

   const handleVerify = async () => {
      try {
        if (otp.join("").length !== 4) {
          alert("Please enter a valid 4-digit OTP");
          return;
        }
    
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone,
            otp: otp.join("")
          }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.message || "OTP verification failed");
        }
    
        if (data.success && data.token) {
          await signIn(data.token);
          router.replace('/(tabs)');
        }
      } catch (error:any) {
        console.error("Verification error:", error);
        alert(error.message || "Verification failed. Please try again.");
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
                  (otp.join("").length < 4 || loading) && styles.disabledButton,
               ]}
               onPress={handleVerify}
               disabled={otp.join("").length < 4 || loading}
            >
               {loading ? (
                  <ActivityIndicator color="#FFF" />
               ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
               )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

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
   errorText: {
      color: "#FF0000",
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
   },
});
