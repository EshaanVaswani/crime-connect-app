import {
   ScrollView,
   YStack,
   XStack,
   Text,
   Avatar,
   Theme,
   Button,
   View,
} from "tamagui";
import {
   ActivityIndicator,
   Alert,
   StyleSheet,
   TouchableOpacity,
   Modal,
   TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#F5F5F5",
   },
   section: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E0E0E0",
   },
   profileHeader: {
      alignItems: "center",
      marginBottom: 24,
   },
   avatarContainer: {
      position: "relative",
      marginBottom: 16,
   },
   editIcon: {
      position: "absolute",
      bottom: -4,
      right: -4,
      backgroundColor: "#B71C1C",
      borderRadius: 12,
      padding: 4,
   },
   header: {
      color: "#B71C1C",
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
   },
   sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
   },
   contactItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#EEEEEE",
   },
   incidentItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#EEEEEE",
   },
   phoneNumber: {
      fontSize: 20,
      color: "#424242",
      fontWeight: "600",
      marginBottom: 4,
   },
   label: {
      color: "#757575",
      fontSize: 14,
      marginBottom: 4,
   },
   value: {
      color: "#424242",
      fontSize: 14,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
   },
   modalContent: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 20,
   },
   modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 20,
      color: "#333",
      textAlign: "center",
   },
   input: {
      height: 50,
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
   },
   emptyState: {
      alignItems: "center",
      padding: 20,
   },
   emptyStateText: {
      color: "#757575",
      marginTop: 8,
   },
   statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
   },
   incidentDescription: {
      color: "#424242",
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
   },
   floatingButton: {
      position: "absolute",
      bottom: 24,
      right: 24,
      borderRadius: 30,
      padding: 16,
      elevation: 4,
   },
});

interface EmergencyContact {
   id: string;
   name: string;
   phone: string;
}

const ProfileScreen = () => {
   const { signOut } = useAuth();
   const [showAddContactModal, setShowAddContactModal] = useState(false);
   const [newContact, setNewContact] = useState({ name: "", phone: "" });
   const [addLoading, setAddLoading] = useState(false);

   const [reportedIncidents, setReportedIncidents] = useState<
      Array<{
         _id: string;
         type: string;
         createdAt: string;
         status: string;
         description: string;
      }>
   >([]);
   const [loadingIncidents, setLoadingIncidents] = useState(true);

   const [userData, setUserData] = useState<{
      phone: string;
      createdAt: string;
   } | null>(null);
   const [loadingUser, setLoadingUser] = useState(true);

   const [emergencyContacts, setEmergencyContacts] = useState<
      EmergencyContact[]
   >([]);
   const [loadingContacts, setLoadingContacts] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const token = await AsyncStorage.getItem("userToken");

            // Fetch emergency contacts
            const contactsRes = await fetch(
               `${process.env.EXPO_PUBLIC_API_URL}/emergency-contact`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!contactsRes.ok) throw new Error("Failed to fetch contacts");
            setEmergencyContacts((await contactsRes.json()).data);

            // Fetch user data
            const userRes = await fetch(
               `${process.env.EXPO_PUBLIC_API_URL}/auth/me`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!userRes.ok) throw new Error("Failed to fetch user data");
            setUserData((await userRes.json()).data);

            // Fetch incidents
            const incidentsRes = await fetch(
               `${process.env.EXPO_PUBLIC_API_URL}/reports/user`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            if (!incidentsRes.ok) throw new Error("Failed to fetch incidents");
            setReportedIncidents((await incidentsRes.json()).data);
         } catch (error: any) {
            Alert.alert("Error", error.message);
         } finally {
            setLoadingContacts(false);
            setLoadingUser(false);
            setLoadingIncidents(false);
         }
      };

      fetchData();
   }, []);

   const handleSubmitContact = async () => {
      try {
         if (!newContact.name || !newContact.phone) {
            Alert.alert("Error", "Please fill all fields");
            return;
         }

         const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
         if (!phoneRegex.test(newContact.phone)) {
            Alert.alert("Error", "Invalid phone number format");
            return;
         }

         setAddLoading(true);
         const token = await AsyncStorage.getItem("userToken");
         const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/emergency-contact`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(newContact),
            }
         );

         if (!response.ok) throw new Error("Failed to add contact");
         setEmergencyContacts([
            ...emergencyContacts,
            (await response.json()).data,
         ]);
         setShowAddContactModal(false);
      } catch (error: any) {
         Alert.alert("Error", error.message);
      } finally {
         setAddLoading(false);
      }
   };

   const handleDeleteContact = async (contactId: string) => {
      try {
         const token = await AsyncStorage.getItem("userToken");
         const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/emergency-contact/${contactId}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
         );

         if (!response.ok) throw new Error("Failed to delete contact");
         setEmergencyContacts(
            emergencyContacts.filter((c) => c.id !== contactId)
         );
      } catch (error: any) {
         Alert.alert("Error", error.message);
      }
   };

   return (
      <Theme name="light">
         <ScrollView style={styles.container}>
            {/* Profile Header */}
            <YStack style={[styles.section, styles.profileHeader]}>
               <YStack style={styles.avatarContainer}>
                  <Avatar circular size={100}>
                     <Avatar.Image src="https://placehold.co/100x100" />
                     <Avatar.Fallback backgroundColor="#E0E0E0" />
                  </Avatar>
                  <View style={styles.editIcon}>
                     <MaterialCommunityIcons
                        name="pencil"
                        size={16}
                        color="white"
                     />
                  </View>
               </YStack>

               <YStack alignItems="center">
                  {loadingUser ? (
                     <ActivityIndicator size="small" color="#B71C1C" />
                  ) : (
                     <>
                        <Text style={styles.phoneNumber}>
                           {userData?.phone}
                        </Text>
                        <Text style={styles.label}>
                           Member since{" "}
                           {userData?.createdAt
                              ? new Date(
                                   userData.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                        </Text>
                     </>
                  )}
               </YStack>
            </YStack>

            {/* Emergency Contacts */}
            <YStack style={styles.section}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.header}>Emergency Contacts</Text>
                  <Text style={styles.label}>
                     {emergencyContacts.length} saved
                  </Text>
               </View>

               {loadingContacts ? (
                  <ActivityIndicator size="small" color="#B71C1C" />
               ) : emergencyContacts.length > 0 ? (
                  emergencyContacts.map((contact) => (
                     <XStack
                        key={`contact-${contact.id}`}
                        style={styles.contactItem}
                        alignItems="center"
                        space="$2"
                     >
                        <MaterialCommunityIcons
                           name="account-alert"
                           size={24}
                           color="#B71C1C"
                        />
                        <YStack flex={1}>
                           <Text style={[styles.value, { fontWeight: "600" }]}>
                              {contact.name}
                           </Text>
                           <Text style={[styles.value, { color: "#757575" }]}>
                              {contact.phone}
                           </Text>
                        </YStack>
                        <TouchableOpacity
                           onPress={() => handleDeleteContact(contact.id)}
                           hitSlop={{
                              top: 15,
                              bottom: 15,
                              left: 15,
                              right: 15,
                           }}
                        >
                           <MaterialCommunityIcons
                              name="delete-outline"
                              size={20}
                              color="#B71C1C"
                           />
                        </TouchableOpacity>
                     </XStack>
                  ))
               ) : (
                  <YStack style={styles.emptyState}>
                     <MaterialCommunityIcons
                        name="account-alert-outline"
                        size={40}
                        color="#B71C1C"
                     />
                     <Text style={styles.emptyStateText}>
                        No emergency contacts saved
                     </Text>
                  </YStack>
               )}
            </YStack>

            {/* Reported Incidents */}
            <YStack style={styles.section}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.header}>Your Reports</Text>
                  <Text style={styles.label}>
                     {reportedIncidents.length} total
                  </Text>
               </View>

               {loadingIncidents ? (
                  <ActivityIndicator size="small" color="#B71C1C" />
               ) : reportedIncidents.length > 0 ? (
                  reportedIncidents.map((incident) => (
                     <YStack
                        key={`incident-${incident._id}`}
                        style={styles.incidentItem}
                        space="$2"
                     >
                        <XStack
                           justifyContent="space-between"
                           alignItems="center"
                        >
                           <YStack flex={1}>
                              <Text
                                 style={[styles.value, { fontWeight: "600" }]}
                              >
                                 {incident.type}
                              </Text>
                              <Text
                                 style={styles.incidentDescription}
                                 numberOfLines={2}
                              >
                                 {incident.description}
                              </Text>
                           </YStack>
                           <YStack
                              style={[
                                 styles.statusBadge,
                                 {
                                    backgroundColor:
                                       incident.status === "Case Closed"
                                          ? "#E8F5E9"
                                          : "#FFEBEE",
                                 },
                              ]}
                           >
                              <MaterialCommunityIcons
                                 name={
                                    incident.status === "Case Closed"
                                       ? "check-circle-outline"
                                       : "clock-alert-outline"
                                 }
                                 size={16}
                                 color={
                                    incident.status === "Case Closed"
                                       ? "#388E3C"
                                       : "#B71C1C"
                                 }
                              />
                              <Text
                                 style={[
                                    styles.value,
                                    {
                                       color:
                                          incident.status === "Case Closed"
                                             ? "#388E3C"
                                             : "#B71C1C",
                                    },
                                 ]}
                              >
                                 {incident.status}
                              </Text>
                           </YStack>
                        </XStack>
                        <Text style={[styles.label, { marginTop: 4 }]}>
                           Reported on{" "}
                           {new Date(incident.createdAt).toLocaleDateString()}
                        </Text>
                     </YStack>
                  ))
               ) : (
                  <YStack style={styles.emptyState}>
                     <MaterialCommunityIcons
                        name="file-document-outline"
                        size={40}
                        color="#B71C1C"
                     />
                     <Text style={styles.emptyStateText}>
                        No incidents reported yet
                     </Text>
                  </YStack>
               )}
            </YStack>

            {/* Floating Action Button */}
            <TouchableOpacity
               style={[styles.floatingButton, { backgroundColor: "#B71C1C" }]}
               onPress={() => setShowAddContactModal(true)}
            >
               <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>

            {/* Add Contact Modal */}
            <Modal
               visible={showAddContactModal}
               animationType="slide"
               transparent={true}
               onRequestClose={() => setShowAddContactModal(false)}
            >
               <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                     <Text style={styles.modalTitle}>
                        Add Emergency Contact
                     </Text>
                     <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={newContact.name}
                        onChangeText={(text) =>
                           setNewContact((p) => ({ ...p, name: text }))
                        }
                        autoCapitalize="words"
                     />
                     <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        value={newContact.phone}
                        onChangeText={(text) =>
                           setNewContact((p) => ({ ...p, phone: text }))
                        }
                        keyboardType="phone-pad"
                     />
                     <XStack gap={10} marginTop={20}>
                        <Button
                           flex={1}
                           onPress={() => setShowAddContactModal(false)}
                           backgroundColor="#E0E0E0"
                           color="#424242"
                        >
                           Cancel
                        </Button>
                        <Button
                           flex={1}
                           onPress={handleSubmitContact}
                           backgroundColor="#B71C1C"
                           color="#FFF"
                           disabled={
                              !newContact.name ||
                              !newContact.phone ||
                              addLoading
                           }
                        >
                           {addLoading ? (
                              <ActivityIndicator color="#FFF" />
                           ) : (
                              "Add Contact"
                           )}
                        </Button>
                     </XStack>
                  </View>
               </View>
            </Modal>

            {/* Logout Section */}
            <YStack style={styles.section} marginTop={24}>
               <Button
                  onPress={() => {
                     Alert.alert(
                        "Log Out",
                        "Are you sure you want to log out?",
                        [
                           { text: "Cancel", style: "cancel" },
                           { text: "Log Out", onPress: signOut },
                        ]
                     );
                  }}
                  backgroundColor="#FFF"
                  borderColor="#B71C1C"
                  borderWidth={1}
                  color="#B71C1C"
                  hoverStyle={{ backgroundColor: "#FFEBEE" }}
               >
                  Log Out
               </Button>
            </YStack>
         </ScrollView>
      </Theme>
   );
};

export default ProfileScreen;
