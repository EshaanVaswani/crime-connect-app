import { ScrollView, YStack, XStack, Text, Image, Button, View } from "tamagui";
import { StyleSheet, Linking, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Report } from "../types/types";

export default function ReportDetailScreen() {
   const { reportId } = useLocalSearchParams();
   const [report, setReport] = useState<Report | null>(null);
   const [loading, setLoading] = useState(true);

   const router = useRouter();

   useEffect(() => {
      const fetchReport = async () => {
         try {
            const response = await fetch(
               `${process.env.EXPO_PUBLIC_API_URL}/reports/${reportId}`
            );
            const data = await response.json();
            setReport(data.data);
         } catch (error) {
            console.error("Error fetching report:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchReport();
   }, [reportId]);

   if (loading) {
      return (
         <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#B71C1C" />
         </YStack>
      );
   }

   if (!report) {
      return (
         <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color="$gray11">Report not found</Text>
         </YStack>
      );
   }

   return (
      <ScrollView style={styles.container}>
         {/* Header with Back Button */}
         <XStack
            alignItems="center"
            padding="$4"
            borderBottomWidth={1}
            borderBottomColor="$gray3"
         >
            <Button
               chromeless
               onPress={() => router.push("/(tabs)/profile")}
               icon={
                  <MaterialCommunityIcons
                     name="arrow-left"
                     size={24}
                     color="#B71C1C"
                  />
               }
            />
            <Text fontSize="$7" fontWeight="700" marginLeft="$2">
               Report Details
            </Text>
         </XStack>

         <YStack space="$6" padding="$4">
            {/* Media Gallery */}
            {report.media?.length > 0 && (
               <YStack space="$3">
                  <Text fontSize="$5" fontWeight="600" color="$gray10">
                     Evidence Photos
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                     {report.media.map((uri, index) => (
                        <Image
                           key={`media-${index}`}
                           source={{ uri }}
                           style={styles.mediaImage}
                           borderRadius={8}
                           marginRight="$2"
                        />
                     ))}
                  </ScrollView>
               </YStack>
            )}

            {/* Main Content */}
            <YStack space="$5">
               {/* Title & Status */}
               <YStack space="$2">
                  <Text fontSize="$8" fontWeight="800" color="$gray12">
                     {report.title}
                  </Text>
                  <XStack
                     backgroundColor={
                        report.status === "pending" ? "#FFEBEE" : "#E8F5E9"
                     }
                     paddingHorizontal="$3"
                     paddingVertical="$2"
                     borderRadius="$2"
                     alignItems="center"
                     gap="$2"
                  >
                     <MaterialCommunityIcons
                        name={
                           report.status === "pending"
                              ? "clock-alert"
                              : "check-circle"
                        }
                        size={18}
                        color={
                           report.status === "pending" ? "#B71C1C" : "#388E3C"
                        }
                     />
                     <Text
                        fontWeight="600"
                        textTransform="capitalize"
                        color={
                           report.status === "pending" ? "#B71C1C" : "#388E3C"
                        }
                     >
                        {report.status.replace("_", " ")}
                     </Text>
                  </XStack>
               </YStack>

               {/* Incident Details Card */}
               <YStack
                  backgroundColor="$gray1"
                  borderRadius="$4"
                  padding="$4"
                  space="$4"
                  elevation="$0.5"
               >
                  {/* Incident Type */}
                  <YStack space="$2">
                     <XStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                           name="alert-circle"
                           size={18}
                           color="#B71C1C"
                        />
                        <Text fontWeight="600" color="$gray12">
                           Incident Type
                        </Text>
                     </XStack>
                     <Text
                        color="$gray11"
                        marginLeft="$5"
                        textTransform="capitalize"
                     >
                        {report.incidentType}
                     </Text>
                  </YStack>

                  {/* Divider */}
                  <View
                     height={1}
                     backgroundColor="$gray3"
                     marginVertical="$2"
                  />

                  {/* Incident Time */}
                  <YStack space="$2">
                     <XStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                           name="clock"
                           size={18}
                           color="#B71C1C"
                        />
                        <Text fontWeight="600" color="$gray12">
                           Incident Time
                        </Text>
                     </XStack>
                     <Text color="$gray11" marginLeft="$5">
                        {new Date(report.dateTime).toLocaleString("en-GB", {
                           weekday: "long",
                           day: "numeric",
                           month: "long",
                           year: "numeric",
                           hour: "2-digit",
                           minute: "2-digit",
                        })}
                     </Text>
                  </YStack>

                  {/* Divider */}
                  <View
                     height={1}
                     backgroundColor="$gray3"
                     marginVertical="$2"
                  />

                  {/* Description */}
                  <YStack space="$2">
                     <XStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                           name="text"
                           size={18}
                           color="#B71C1C"
                        />
                        <Text fontWeight="600" color="$gray12">
                           Description
                        </Text>
                     </XStack>
                     <Text color="$gray11" lineHeight="$2" marginLeft="$5">
                        {report.description}
                     </Text>
                  </YStack>

                  {/* Divider */}
                  <View
                     height={1}
                     backgroundColor="$gray3"
                     marginVertical="$2"
                  />

                  {/* Location */}
                  <YStack space="$2">
                     <XStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                           name="map-marker"
                           size={18}
                           color="#B71C1C"
                        />
                        <Text fontWeight="600" color="$gray12">
                           Location
                        </Text>
                     </XStack>
                     <Text color="$gray11" marginLeft="$5">
                        {report.location.address}
                     </Text>
                     <Button
                        marginTop="$2"
                        backgroundColor={"#B71C1C"}
                        color={"white"}
                        onPress={() =>
                           Linking.openURL(
                              `https://www.google.com/maps?q=${report.location.coordinates[1]},${report.location.coordinates[0]}`
                           )
                        }
                        icon={
                           <MaterialCommunityIcons
                              name="google-maps"
                              size={16}
                              color="white"
                           />
                        }
                     >
                        View on Map
                     </Button>
                  </YStack>

                  {/* Suspect Description */}
                  {report.suspectDescription && (
                     <>
                        <View
                           height={1}
                           backgroundColor="$gray3"
                           marginVertical="$2"
                        />
                        <YStack space="$2">
                           <XStack alignItems="center" gap="$2">
                              <MaterialCommunityIcons
                                 name="account-alert"
                                 size={18}
                                 color="#B71C1C"
                              />
                              <Text fontWeight="600" color="$gray12">
                                 Suspect Description
                              </Text>
                           </XStack>
                           <Text color="$gray11" marginLeft="$5">
                              {report.suspectDescription}
                           </Text>
                        </YStack>
                     </>
                  )}

                  {/* Witness Details */}
                  {report.witnessDetails && (
                     <>
                        <View
                           height={1}
                           backgroundColor="$gray3"
                           marginVertical="$2"
                        />
                        <YStack space="$2">
                           <XStack alignItems="center" gap="$2">
                              <MaterialCommunityIcons
                                 name="account-eye"
                                 size={18}
                                 color="#B71C1C"
                              />
                              <Text fontWeight="600" color="$gray12">
                                 Witness Details
                              </Text>
                           </XStack>
                           <Text color="$gray11" marginLeft="$5">
                              {report.witnessDetails}
                           </Text>
                        </YStack>
                     </>
                  )}

                  {/* Reporter Info */}
                  {!report.anonymous && report.user && (
                     <>
                        <View
                           height={1}
                           backgroundColor="$gray3"
                           marginVertical="$2"
                        />
                        <YStack space="$2">
                           <XStack alignItems="center" gap="$2">
                              <MaterialCommunityIcons
                                 name="account"
                                 size={18}
                                 color="#B71C1C"
                              />
                              <Text fontWeight="600" color="$gray12">
                                 Reported By
                              </Text>
                           </XStack>
                           <YStack marginLeft="$5" space="$1">
                              <Text color="$gray11">{report.user.phone}</Text>
                              <Text color="$gray9" fontSize="$2">
                                 Member since{" "}
                                 {new Date(
                                    report.user.createdAt
                                 ).toLocaleDateString()}
                              </Text>
                           </YStack>
                        </YStack>
                     </>
                  )}

                  {/* Report Metadata */}
                  <View
                     height={1}
                     backgroundColor="$gray3"
                     marginVertical="$2"
                  />
                  <YStack space="$2">
                     <XStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                           name="calendar"
                           size={18}
                           color="#B71C1C"
                        />
                        <Text fontWeight="600" color="$gray12">
                           Report Submitted
                        </Text>
                     </XStack>
                     <Text color="$gray11" marginLeft="$5">
                        {new Date(report.createdAt).toLocaleString()}
                     </Text>
                  </YStack>
               </YStack>
            </YStack>
         </YStack>
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#F5F5F5",
   },
   mediaImage: {
      width: 280,
      height: 200,
      borderRadius: 8,
      marginRight: 12,
   },
});
