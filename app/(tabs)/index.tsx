import { useState, useEffect, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
   View,
   Modal,
   StyleSheet,
   Alert,
   Linking,
   TouchableOpacity,
   Platform,
   ActivityIndicator,
   RefreshControl,
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
import { MarkerColors, Report, SeverityColors } from "../types/types";
import debounce from "../utils/debounce";

const emergencyContacts = [
   { id: 1, name: "Police", number: "100" },
   { id: 2, name: "Fire", number: "101" },
   { id: 3, name: "Ambulance", number: "102" },
   { id: 4, name: "Women Helpline", number: "1091" },
];
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
   const [selectedCrime, setSelectedCrime] = useState<Report | null>(null);
   const [locationError, setLocationError] = useState(false);
   const [isSosActive, setIsSosActive] = useState(false);
   const [sosCountdown, setSosCountdown] = useState(5);
   const [showQuickPanel, setShowQuickPanel] = useState(false);
   const [mapType, setMapType] = useState<MapType>("standard");
   const [crimes, setCrimes] = useState<Report[]>([]);
   const [loadingCrimes, setLoadingCrimes] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
   const [crimeCache, setCrimeCache] = useState<{ [key: string]: Report[] }>(
      {}
   );
   const [recentAlerts, setRecentAlerts] = useState<Report[] | null>([]);
   const [loadingRecentAlerts, setLoadingRecentAlerts] = useState(true);

   const debouncedRegionHandler = useMemo(
      () =>
         debounce((newRegion: typeof region) => {
            if (newRegion) {
               setRegion(newRegion);
               fetchCrimes(newRegion);
            }
         }, 1000),
      []
   );

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

   const fetchCrimes = useCallback(
      async (currentRegion: typeof region) => {
         if (!currentRegion) return;

         try {
            setLoadingCrimes(true);
            const cacheKey = `${currentRegion.latitude.toFixed(
               4
            )}-${currentRegion.longitude.toFixed(4)}`;

            const response = await fetch(
               `${process.env.EXPO_PUBLIC_API_URL}/reports/radius/${currentRegion.latitude}/${currentRegion.longitude}/5`
            );

            if (!response.ok) throw new Error("Failed to fetch crimes");

            const data = await response.json();

            // Filter out invalid reports and map safely
            const validReports = data.data.filter(
               (report: Report) => report.location?.coordinates?.length === 2
            );

            const newCrimes = validReports.map((report: Report) => ({
               ...report,
               coordinate: {
                  latitude: report.location.coordinates[1],
                  longitude: report.location.coordinates[0],
               },
               date: new Date(report.createdAt).toLocaleString(),
               reporter: report.anonymous
                  ? "Anonymous"
                  : report.user?.phone || "Unknown",
            }));

            setCrimeCache((prev) => ({ ...prev, [cacheKey]: newCrimes }));
            setCrimes((prev) =>
               JSON.stringify(prev) === JSON.stringify(newCrimes)
                  ? prev
                  : newCrimes
            );
         } catch (err: any) {
            setError(err.message);
            console.error("Error fetching crimes:", err);
         } finally {
            setLoadingCrimes(false);
         }
      },
      [crimeCache]
   );

   useEffect(() => {
      if (!region) return;

      fetchCrimes(region);
   }, [region]);

   const fetchRecentAlerts = async () => {
      try {
         const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/reports/recent?limit=3`
         );
         const data = await response.json();
         setRecentAlerts(data.data);
      } catch (err) {
         console.error("Error fetching recent alerts:", err);
      } finally {
         setLoadingRecentAlerts(false);
      }
   };

   useEffect(() => {
      fetchRecentAlerts();
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

   const getAlertIcon = (type: string) => {
      switch (type) {
         case "theft":
            return "bag-personal";
         case "assault":
            return "police-badge";
         case "burglary":
            return "home-alert";
         case "missing":
            return "account-alert";
         default:
            return "alert-circle";
      }
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
                  ? `https://www.google.com/maps?q=${region.latitude},${region.longitude}`
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

   const handleRefresh = useCallback(async () => {
      const now = Date.now();
      if (now - lastRefreshTime < 30000) {
         Alert.alert("Please wait", "You can refresh once every 30 seconds");
         return;
      }

      setLastRefreshTime(now);
      try {
         setLoadingCrimes(true);
         setLoadingRecentAlerts(true);
         await Promise.all([fetchCrimes(region), fetchRecentAlerts()]);
      } catch (err: any) {
         setError(err.message);
      } finally {
         setLoadingCrimes(false);
         setLoadingRecentAlerts(false);
      }
   }, [lastRefreshTime, region]);

   // Marker color based on crime type

   const getMarkerColor = (type: keyof MarkerColors): string => {
      const colors: MarkerColors = {
         theft: "#FF0000",
         assault: "#FF8C00",
         burglary: "#FFD700",
         vandalism: "#8A2BE2",
         missing: "#1E90FF",
         other: "#32CD32",
         default: "#808080",
      };
      return colors[type] || colors.default;
   };

   const renderCrimeMarkers = useMemo(
      () =>
         crimes
            .filter((crime) => crime.location?.coordinates?.length === 2)
            .map((crime) => {
               const [longitude, latitude] = crime.location.coordinates;
               return (
                  <Marker
                     key={crime._id}
                     coordinate={{
                        latitude,
                        longitude,
                     }}
                     onPress={() => setSelectedCrime(crime)}
                  >
                     <MaterialCommunityIcons
                        name="alert-circle"
                        size={32}
                        color={getMarkerColor(
                           crime.incidentType as keyof MarkerColors
                        )}
                     />
                  </Marker>
               );
            }),
      [crimes]
   );

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

   const renderQuickPanel = useMemo(
      () =>
         showQuickPanel && (
            <ScrollView style={styles.quickPanel}>
               <YStack space="$3" padding="$3">
                  {/* Header */}
                  <XStack alignItems="center" justifyContent="space-between">
                     <Text fontSize="$6" color="#000" fontWeight="800">
                        QUICK ACCESS
                     </Text>
                     <TouchableOpacity
                        onPress={() => setShowQuickPanel(false)}
                        hitSlop={10}
                     >
                        <MaterialCommunityIcons
                           name="close"
                           size={24}
                           color="#000"
                        />
                     </TouchableOpacity>
                  </XStack>

                  {/* Recent Alerts */}
                  <YStack space="$2">
                     <Text fontSize="$5" color="#000" fontWeight="700">
                        Recent Alerts
                     </Text>
                     {loadingRecentAlerts ? (
                        <ActivityIndicator color="#B71C1C" />
                     ) : recentAlerts?.length === 0 ? (
                        <Card backgroundColor="#FFF5F5" padding="$3" bordered>
                           <Text color="#000" opacity={0.8}>
                              No recent alerts
                           </Text>
                        </Card>
                     ) : (
                        <YStack space="$2">
                           {recentAlerts?.map((alert) => (
                              <Card
                                 key={alert._id}
                                 backgroundColor="white"
                                 borderColor="#FFEBEE"
                                 borderWidth={2}
                                 padding="$3"
                              >
                                 <XStack alignItems="center" space="$2">
                                    <MaterialCommunityIcons
                                       name={getAlertIcon(alert.incidentType)}
                                       size={20}
                                       color="#B71C1C"
                                    />
                                    <YStack>
                                       <Text color="#000" fontWeight="600">
                                          {alert.title}
                                       </Text>
                                       <Text color="#000" fontSize="$1">
                                          {formatDistanceToNow(
                                             new Date(alert.createdAt)
                                          )}{" "}
                                          ago
                                       </Text>
                                    </YStack>
                                 </XStack>
                              </Card>
                           ))}
                        </YStack>
                     )}
                  </YStack>

                  {/* Emergency Contacts */}
                  <YStack space="$2">
                     <Text fontSize="$5" color="#000" fontWeight="700">
                        Emergency Contacts
                     </Text>
                     <YStack space="$2">
                        {emergencyContacts.map((contact) => (
                           <TouchableOpacity
                              key={contact.id}
                              onPress={() => callEmergency(contact.number)}
                           >
                              <Card
                                 backgroundColor="white"
                                 borderColor="#FFEBEE"
                                 borderWidth={2}
                                 padding="$3"
                              >
                                 <XStack
                                    alignItems="center"
                                    justifyContent="space-between"
                                 >
                                    <Text color="#000" fontWeight="600">
                                       {contact.name}
                                    </Text>
                                    <XStack alignItems="center" space="$2">
                                       <Text color="#000">
                                          {contact.number}
                                       </Text>
                                       <MaterialCommunityIcons
                                          name="phone"
                                          size={20}
                                          color="#B71C1C"
                                       />
                                    </XStack>
                                 </XStack>
                              </Card>
                           </TouchableOpacity>
                        ))}
                     </YStack>
                  </YStack>
               </YStack>
            </ScrollView>
         ),
      [showQuickPanel, recentAlerts, loadingRecentAlerts]
   );

   const renderModalContent = useMemo(
      () => (
         <YStack space="$4">
            <XStack alignItems="center" space="$3">
               <MaterialCommunityIcons
                  name={getAlertIcon(selectedCrime?.incidentType || "")}
                  size={24}
                  color="#B71C1C"
               />
               <Text fontSize={20} fontWeight="bold" color="#B71C1C">
                  {selectedCrime?.title}
               </Text>
            </XStack>

            <YStack space="$2">
               <XStack alignItems="center" space="$2">
                  <MaterialCommunityIcons
                     name="shape"
                     size={16}
                     color="$gray10"
                  />
                  <Text fontSize={14} color="$gray10">
                     Incident Type:
                  </Text>
                  <Text fontSize={14} color="$gray12">
                     {selectedCrime?.incidentType || "Unknown"}
                  </Text>
               </XStack>

               <XStack alignItems="center" space="$2">
                  <MaterialCommunityIcons
                     name="clock"
                     size={16}
                     color="$gray10"
                  />
                  <Text fontSize={14} color="$gray10">
                     Reported:
                  </Text>
                  <Text fontSize={14} color="$gray12">
                     {selectedCrime?.dateTime
                        ? `${formatDistanceToNow(
                             new Date(selectedCrime.dateTime)
                          )} ago`
                        : "Unknown time"}
                  </Text>
               </XStack>

               <XStack alignItems="center" space="$2">
                  <MaterialCommunityIcons
                     name="map-marker"
                     size={16}
                     color="$gray10"
                  />
                  <Text fontSize={14} color="$gray10">
                     Status:
                  </Text>
                  <View
                     style={[
                        styles.statusBadge,
                        {
                           backgroundColor: getSeverityColor(
                              selectedCrime?.status === "resolved"
                                 ? "low"
                                 : "high"
                           ),
                        },
                     ]}
                  >
                     <Text
                        fontSize={12}
                        color="white"
                        textTransform="capitalize"
                     >
                        {selectedCrime?.status}
                     </Text>
                  </View>
               </XStack>
            </YStack>

            {selectedCrime?.description && (
               <YStack space="$2">
                  <Text fontSize={14} fontWeight="500" color="$gray10">
                     Description
                  </Text>
                  <Text fontSize={14} color="$gray12">
                     {selectedCrime.description}
                  </Text>
               </YStack>
            )}

            {/* Add similar improvements for other sections */}
         </YStack>
      ),
      [selectedCrime]
   );

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

   if (loadingCrimes) {
      return (
         <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#B71C1C" />
            <Text marginTop="$2">Loading crime reports...</Text>
         </YStack>
      );
   }

   if (error) {
      return (
         <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
         >
            <Text color="#B71C1C" marginBottom="$2">
               Error loading crime data
            </Text>
            <Text textAlign="center" marginBottom="$4">
               {error}
            </Text>
            <Button onPress={() => setError(null)}>Retry</Button>
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
                  onRegionChangeComplete={debouncedRegionHandler}
               >
                  {renderCrimeMarkers}
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

            {/* Quick Panel */}
            {renderQuickPanel}

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
                     <ScrollView
                        refreshControl={
                           <RefreshControl
                              refreshing={loadingCrimes}
                              onRefresh={handleRefresh}
                              colors={["#B71C1C"]}
                              progressViewOffset={50}
                              tintColor="#B71C1C"
                           />
                        }
                     >
                        {renderModalContent}
                     </ScrollView>
                  </Card>
               </View>
            </Modal>

            {loadingCrimes && (
               <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#B71C1C" />
               </View>
            )}
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
      top: Platform.OS === "ios" ? 60 : 40,
      left: 12,
      right: 12,
      maxHeight: "75%",
      backgroundColor: "white",
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "#e0e0e0",
      elevation: 4,
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
   loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
   },
   refreshIndicator: {
      position: "absolute",
      top: Platform.OS === "ios" ? 100 : 80,
      alignSelf: "center",
      zIndex: 1,
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: 10,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
   },
   statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
   },
});
