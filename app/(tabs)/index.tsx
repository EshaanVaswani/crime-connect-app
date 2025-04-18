import { useState, useEffect } from "react";
import {
   View,
   Modal,
   StyleSheet,
   Alert,
   Linking,
   TouchableOpacity,
   Platform,
} from "react-native";
import MapView, { MapType, Marker } from "react-native-maps";
import {
   YStack,
   XStack,
   Text,
   Button,
   Theme,
   Card,
   ScrollView,
   Input,
} from "tamagui";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { router } from "expo-router";

type Crime = {
   id: number;
   title: string;
   type: string;
   coordinate: {
      latitude: number;
      longitude: number;
   };
   date: string;
   description: string;
   status: string;
   reporter: string;
};

const dummyCrimes = [
   {
      id: 1,
      title: "Bicycle Theft",
      type: "theft",
      coordinate: {
         latitude: 19.0699,
         longitude: 72.8374,
      },
      date: "2024-03-20 14:30",
      description: "Stolen bicycle from parking rack",
      status: "Under Investigation",
      reporter: "Anonymous",
   },
   {
      id: 2,
      title: "Suspicious Activity",
      type: "suspicious",
      coordinate: {
         latitude: 19.0548,
         longitude: 72.8407,
      },
      date: "2024-04-10 20:15",
      description: "Person lurking around parked vehicles",
      status: "Reported",
      reporter: "John D.",
   },
   {
      id: 3,
      title: "Vandalism",
      type: "vandalism",
      coordinate: {
         latitude: 19.0682,
         longitude: 72.8505,
      },
      date: "2024-04-12 08:30",
      description: "Graffiti on public building",
      status: "Under Investigation",
      reporter: "Community Watch",
   },
];

// Emergency numbers
const emergencyContacts = [
   { id: 1, name: "Police", number: "100" },
   { id: 2, name: "Fire", number: "101" },
   { id: 3, name: "Ambulance", number: "102" },
   { id: 4, name: "Women Helpline", number: "1091" },
];

// Recent alerts to display in the quick panel
const recentAlerts = [
   {
      id: 1,
      title: "Increased theft reports",
      time: "2 hours ago",
      severity: "medium",
   },
   {
      id: 2,
      title: "Road closed due to accident",
      time: "5 hours ago",
      severity: "high",
   },
   {
      id: 3,
      title: "Missing person reported",
      time: "Yesterday",
      severity: "high",
   },
];

export default function HomeScreen() {
   const [region, setRegion] = useState<{
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
   } | null>(null);
   const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
   const [locationError, setLocationError] = useState(false);
   const [isSosActive, setIsSosActive] = useState(false);
   const [sosCountdown, setSosCountdown] = useState(5);
   const [showQuickPanel, setShowQuickPanel] = useState(false);
   const [mapType, setMapType] = useState<MapType>("standard");

   // Get user location
   useEffect(() => {
      (async () => {
         let { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== "granted") {
            setLocationError(true);
            return;
         }

         let location = await Location.getCurrentPositionAsync({});
         setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
         });
      })();
   }, []);

   // SOS countdown effect
   useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isSosActive && sosCountdown > 0) {
         interval = setInterval(() => {
            setSosCountdown((prev) => prev - 1);
         }, 1000);
      } else if (isSosActive && sosCountdown === 0) {
         sendEmergencySOS();
         setIsSosActive(false);
         setSosCountdown(5);
      }
      return () => clearInterval(interval);
   }, [isSosActive, sosCountdown]);

   // Handle SOS button press
   const handleSosPress = () => {
      setIsSosActive(true);
      Alert.alert(
         "SOS Activated",
         "Emergency services will be contacted in 5 seconds. Tap Cancel to stop.",
         [
            {
               text: "Cancel",
               onPress: () => {
                  setIsSosActive(false);
                  setSosCountdown(5);
               },
               style: "cancel",
            },
         ]
      );
   };

   // Send emergency SOS
   const sendEmergencySOS = async () => {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
         // In a real app, this would use actual emergency contacts
         const { result } = await SMS.sendSMSAsync(
            [emergencyContacts[0].number],
            `EMERGENCY: Need immediate assistance at my location. ${
               region
                  ? `Lat: ${region.latitude}, Long: ${region.longitude}`
                  : ""
            }`
         );
         if (result === "sent") {
            Alert.alert("Emergency Alert Sent", "Help is on the way");
         }
      } else {
         // Fallback to dialing emergency number
         Linking.openURL(`tel:${emergencyContacts[0].number}`);
      }
   };

   // Call emergency number
   const callEmergency = (number: string): void => {
      Linking.openURL(`tel:${number}`);
      setShowQuickPanel(false);
   };

   // Marker color based on crime type
   interface MarkerColors {
      theft: string;
      assault: string;
      suspicious: string;
      vandalism: string;
      default: string;
   }

   const getMarkerColor = (type: keyof MarkerColors): string => {
      const colors: MarkerColors = {
         theft: "#B71C1C",
         assault: "#D32F2F",
         suspicious: "#FFA000",
         vandalism: "#7B1FA2",
         default: "#B71C1C",
      };
      return colors[type] || colors.default;
   };

   interface SeverityColors {
      low: string;
      medium: string;
      high: string;
      [key: string]: string;
   }

   const getSeverityColor = (severity: keyof SeverityColors): string => {
      const colors: SeverityColors = {
         low: "#4CAF50",
         medium: "#FFA000",
         high: "#D32F2F",
      };
      return colors[severity] || colors.medium;
   };

   // Quick Report button handler
   const handleQuickReport = () => {
      // Navigate to the reporting screen
      // In a real implementation, you would use navigation
      if (router) {
         router.push("/report");
      } else {
         Alert.alert(
            "Navigation to Report Screen",
            "This would navigate to your reporting form"
         );
      }
   };

   if (locationError) {
      return (
         <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding={20}
         >
            <Text color="#B71C1C" fontSize={18} marginBottom={20}>
               Location access required to show crime map
            </Text>
            <Button onPress={() => Linking.openSettings()}>
               Open Settings
            </Button>
         </YStack>
      );
   }

   return (
      <Theme name="light">
         <View style={styles.container}>
            {/* Map View */}
            {region ? (
               <MapView
                  style={styles.map}
                  initialRegion={region}
                  mapType={mapType}
                  showsUserLocation={true}
               >
                  {/* Crime Markers */}
                  {dummyCrimes.map((crime) => (
                     <Marker
                        key={crime.id}
                        coordinate={crime.coordinate}
                        onPress={() => setSelectedCrime(crime)}
                     >
                        <MaterialCommunityIcons
                           name="alert-circle"
                           size={32}
                           color={getMarkerColor(
                              crime.type as keyof MarkerColors
                           )}
                        />
                     </Marker>
                  ))}
               </MapView>
            ) : (
               <YStack flex={1} justifyContent="center" alignItems="center">
                  <Text>Loading crime map...</Text>
               </YStack>
            )}

            {/* Top Action Bar */}
            <View style={styles.topBar}>
               <XStack space="$2" justifyContent="space-between" width="100%">
                  <TouchableOpacity
                     style={styles.iconButton}
                     onPress={() => setShowQuickPanel(!showQuickPanel)}
                  >
                     <MaterialCommunityIcons
                        name="menu"
                        size={24}
                        color="white"
                     />
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={styles.mapTypeButton}
                     onPress={() =>
                        setMapType(
                           mapType === "standard" ? "satellite" : "standard"
                        )
                     }
                  >
                     <MaterialCommunityIcons
                        name="map"
                        size={24}
                        color="white"
                     />
                  </TouchableOpacity>
               </XStack>
            </View>

            {/* Quick Panel Slide-in */}
            {showQuickPanel && (
               <View style={styles.quickPanel}>
                  <YStack space="$3" padding="$3">
                     <Text fontSize={18} fontWeight="bold">
                        Recent Alerts
                     </Text>
                     {recentAlerts.map((alert) => (
                        <Card key={alert.id} padding="$2" bordered>
                           <XStack
                              justifyContent="space-between"
                              alignItems="center"
                           >
                              <YStack>
                                 <Text fontWeight="500">{alert.title}</Text>
                                 <Text fontSize={12} color="#757575">
                                    {alert.time}
                                 </Text>
                              </YStack>
                              <View
                                 style={[
                                    styles.severityIndicator,
                                    {
                                       backgroundColor: getSeverityColor(
                                          alert.severity
                                       ),
                                    },
                                 ]}
                              />
                           </XStack>
                        </Card>
                     ))}

                     <Text fontSize={18} fontWeight="bold" marginTop="$2">
                        Emergency Services
                     </Text>
                     {emergencyContacts.map((contact) => (
                        <TouchableOpacity
                           key={contact.id}
                           onPress={() => callEmergency(contact.number)}
                        >
                           <Card padding="$2" bordered>
                              <XStack
                                 justifyContent="space-between"
                                 alignItems="center"
                              >
                                 <Text>{contact.name}</Text>
                                 <XStack alignItems="center" space="$1">
                                    <Text color="#757575">
                                       {contact.number}
                                    </Text>
                                    <MaterialCommunityIcons
                                       name="phone"
                                       size={20}
                                       color="#4CAF50"
                                    />
                                 </XStack>
                              </XStack>
                           </Card>
                        </TouchableOpacity>
                     ))}
                  </YStack>
               </View>
            )}

            {/* Bottom Action Buttons */}
            <View style={styles.bottomActions}>
               <XStack justifyContent="space-between" width="100%" padding="$2">
                  <TouchableOpacity
                     style={styles.reportButton}
                     onPress={handleQuickReport}
                  >
                     <MaterialCommunityIcons
                        name="clipboard-alert"
                        size={24}
                        color="white"
                     />
                     <Text color="white" fontWeight="bold">
                        Report Crime
                     </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                     style={[
                        styles.sosButton,
                        isSosActive && styles.sosButtonActive,
                     ]}
                     onPress={handleSosPress}
                  >
                     <Text color="white" fontWeight="bold" fontSize={18}>
                        {isSosActive ? `SOS (${sosCountdown})` : "SOS"}
                     </Text>
                  </TouchableOpacity>
               </XStack>
            </View>

            {/* Crime Detail Modal */}
            <Modal
               visible={!!selectedCrime}
               animationType="slide"
               transparent={true}
               onRequestClose={() => setSelectedCrime(null)}
            >
               <View style={styles.modalOverlay}>
                  <Card style={styles.modalContent}>
                     <ScrollView>
                        <YStack space="$3">
                           <Text
                              fontSize={20}
                              fontWeight="bold"
                              color="#B71C1C"
                           >
                              {selectedCrime?.title}
                           </Text>

                           <YStack>
                              <Text width={100} color="#757575">
                                 Type:
                              </Text>
                              <Text color="#424242">{selectedCrime?.type}</Text>
                           </YStack>

                           <YStack>
                              <Text width={100} color="#757575">
                                 Date:
                              </Text>
                              <Text color="#424242">{selectedCrime?.date}</Text>
                           </YStack>

                           <YStack>
                              <Text width={100} color="#757575">
                                 Status:
                              </Text>
                              <Text color="#B71C1C">
                                 {selectedCrime?.status}
                              </Text>
                           </YStack>

                           <YStack>
                              <Text color="#757575">Description:</Text>
                              <Text color="#424242">
                                 {selectedCrime?.description}
                              </Text>
                           </YStack>

                           <XStack space="$2" marginTop={16}>
                              <Button
                                 flex={1}
                                 theme="active"
                                 onPress={() => setSelectedCrime(null)}
                              >
                                 Close
                              </Button>
                              <Button
                                 flex={1}
                                 backgroundColor="#4CAF50"
                                 onPress={() => {
                                    setSelectedCrime(null);
                                    // Here you could navigate to a screen with more details
                                    Alert.alert(
                                       "More Details",
                                       "This would show more details or allow reporting similar incidents"
                                    );
                                 }}
                              >
                                 More Details
                              </Button>
                           </XStack>
                        </YStack>
                     </ScrollView>
                  </Card>
               </View>
            </Modal>
         </View>
      </Theme>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   map: {
      width: "100%",
      height: "100%",
   },
   topBar: {
      position: "absolute",
      top: Platform.OS === "ios" ? 50 : 30,
      left: 0,
      right: 0,
      paddingHorizontal: 15,
   },
   iconButton: {
      backgroundColor: "rgba(33, 33, 33, 0.7)",
      borderRadius: 30,
      padding: 10,
   },
   mapTypeButton: {
      backgroundColor: "rgba(33, 33, 33, 0.7)",
      borderRadius: 30,
      padding: 10,
   },
   quickPanel: {
      position: "absolute",
      top: Platform.OS === "ios" ? 100 : 80,
      left: 15,
      width: "80%",
      maxHeight: "60%",
      backgroundColor: "white",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
   },
   severityIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
   },
   bottomActions: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
   },
   reportButton: {
      backgroundColor: "#1976D2",
      borderRadius: 30,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   sosButton: {
      backgroundColor: "#B71C1C",
      borderRadius: 40,
      width: 80,
      height: 80,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   sosButtonActive: {
      backgroundColor: "#D32F2F",
      transform: [{ scale: 1.05 }],
   },
   modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
   },
   modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "60%",
   },
});
