import { useState, useEffect } from "react";
import {
   Button,
   Form,
   Input,
   TextArea,
   Label,
   XStack,
   YStack,
   Checkbox,
   ScrollView,
   Theme,
   Text,
} from "tamagui";
import {
   Image,
   StyleSheet,
   Platform,
   View,
   Alert,
   TouchableOpacity,
   Modal,
   FlatList,
   SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Zod validation schema
const reportSchema = z.object({
   incidentType: z.enum(["theft", "assault", "vandalism", "burglary", "other"]),
   dateTime: z.date().max(new Date(), "Incident can't be in future"),
   location: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().min(10),
   }),
   description: z.string().min(50).max(500),
   media: z.array(z.string()).max(5).optional(),
   suspectDescription: z.string().max(200).optional(),
   anonymous: z.boolean().default(false),
});

type DropdownItem = {
   label: string;
   value: string;
};

// Define incident types for dropdown
const incidentTypes: DropdownItem[] = [
   { label: "Theft", value: "theft" },
   { label: "Assault", value: "assault" },
   { label: "Vandalism", value: "vandalism" },
   { label: "Burglary", value: "burglary" },
   { label: "Missing Person", value: "missing" },
   { label: "Other", value: "other" },
];

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#F5F5F5",
   },
   thumbnail: {
      width: 80,
      height: 80,
      margin: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E0E0E0",
   },
   headerContainer: {
      marginVertical: 20,
      alignItems: "center",
      padding: 16,
      backgroundColor: "#B71C1C",
      borderRadius: 12,
   },
   headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
   },
   formSection: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
   },
   button: {
      backgroundColor: "#B71C1C",
      borderRadius: 8,
      paddingVertical: 12,
      elevation: 2,
   },
   buttonText: {
      color: "white",
      textAlign: "center",
      fontWeight: "600",
      fontSize: 16,
   },
   label: {
      marginBottom: 8,
      fontWeight: "600",
      color: "#424242",
      fontSize: 14,
   },
   input: {
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "white",
      fontSize: 14,
   },
   imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 10,
   },
   errorText: {
      color: "#D32F2F",
      fontSize: 12,
      marginTop: 4,
   },
   selectButton: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
   },
   dropdownButtonText: {
      fontSize: 14,
      color: "#424242",
   },
   dropdownButtonPlaceholder: {
      fontSize: 14,
      color: "#9E9E9E",
   },
   // Modal styles
   modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
   },
   modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "60%",
   },
   modalHeader: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 15,
      textAlign: "center",
   },
   modalItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#EEEEEE",
   },
   modalItemText: {
      fontSize: 16,
   },
   modalCancelButton: {
      marginTop: 10,
      padding: 15,
      borderRadius: 8,
      backgroundColor: "#F5F5F5",
      alignItems: "center",
   },
   modalCancelText: {
      fontSize: 16,
      color: "#B71C1C",
      fontWeight: "600",
   },
   chevronDown: {
      fontSize: 16,
      color: "#757575",
   },
});

export default function ReportScreen() {
   const {
      control,
      handleSubmit,
      setValue,
      reset,
      formState: { errors },
   } = useForm({
      resolver: zodResolver(reportSchema),
      defaultValues: {
         anonymous: false,
         location: { address: "" },
         media: [],
         dateTime: undefined,
      },
   });

   const [images, setImages] = useState<string[]>([]);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [date, setDate] = useState(new Date());
   const [mode, setMode] = useState<"date" | "time">("date");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);

   const pickImage = async (useCamera = false) => {
      const { status } =
         await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
         Alert.alert(
            "Permission needed",
            "We need access to your photos to upload images."
         );
         return;
      }

      const options: ImagePicker.ImagePickerOptions = {
         mediaTypes: "images",
         quality: 0.7,
         allowsMultipleSelection: !useCamera,
         allowsEditing: useCamera,
      };

      const result = useCamera
         ? await ImagePicker.launchCameraAsync(options)
         : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets) {
         const newImages = [
            ...images,
            ...result.assets.map((asset) => asset.uri),
         ];
         setImages(newImages);
         setValue("media", newImages); // Update the form value
      }
   };

   const handleLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
         Alert.alert(
            "Permission needed",
            "We need location access to determine your current position."
         );
         return;
      }

      try {
         const location = await Location.getCurrentPositionAsync({});
         const address = await reverseGeocode(
            location.coords.latitude,
            location.coords.longitude
         );

         setValue("location", {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            address:
               address ||
               `Near ${location.coords.latitude.toFixed(
                  4
               )}, ${location.coords.longitude.toFixed(4)}`,
         });
      } catch (error) {
         Alert.alert("Location Error", "Could not get your current location.");
      }
   };

   // Mock function - would use a real geocoding service in production
   const reverseGeocode = async (lat: number, lng: number) => {
      // In a real app, use a service like Google Maps Geocoding API
      return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
   };

   // Modified onSubmit function for ReportScreen.tsx
   const onSubmit = async (formData: any) => {
      try {
         setIsSubmitting(true);
         setSubmitError(null);
         console.log("Form data before processing:", formData);

         // Create a proper FormData object
         const form = new FormData();

         // Append simple fields
         form.append("incidentType", formData.incidentType);
         form.append("dateTime", formData.dateTime.toISOString());
         form.append("description", formData.description);
         form.append("anonymous", formData.anonymous.toString());

         // Convert location object to JSON string
         form.append("location", JSON.stringify(formData.location));

         // Add suspect description if present
         if (formData.suspectDescription) {
            form.append("suspectDescription", formData.suspectDescription);
         }

         // Handle media files correctly
         if (formData.media && formData.media.length > 0) {
            formData.media.forEach((uri: string, index: number) => {
               // Get file extension and name from URI
               const uriParts = uri.split(".");
               const fileExtension = uriParts[uriParts.length - 1];
               const fileName =
                  uri.split("/").pop() || `image_${index}.${fileExtension}`;

               // Determine file type based on extension
               const fileType =
                  fileExtension.toLowerCase() === "png"
                     ? "image/png"
                     : fileExtension.toLowerCase() === "gif"
                     ? "image/gif"
                     : "image/jpeg";

               // Create the file object correctly for React Native
               const fileObj = {
                  uri:
                     Platform.OS === "android"
                        ? uri
                        : uri.replace("file://", ""),
                  type: fileType,
                  name: fileName,
               };

               // Append each file individually with the field name "media"
               form.append("media", fileObj as any);
            });
         }

         // Get auth token if needed
         let token = null;
         try {
            token = await AsyncStorage.getItem("token");
         } catch (e) {
            console.log("No token available");
         }

         console.log("Making fetch request to /reports");

         // Define the API URL
         const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/reports`;

         // Make the fetch request
         const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
               // Don't manually set Content-Type for FormData with fetch
               // It needs to set its own boundary
               Accept: "application/json",
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: form,
         });

         // Check if response is ok
         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
               errorData.message || `Server responded with ${response.status}`
            );
         }

         const responseData = await response.json();
         console.log("API response:", responseData);

         // Reset form on success
         reset();
         setImages([]);
         Alert.alert("Success", "Report submitted successfully!");
      } catch (error: any) {
         console.error("Full error:", error);
         let errorMessage = "Failed to submit report";

         if (error.message) {
            errorMessage = error.message;
         }

         setSubmitError(errorMessage);
         Alert.alert("Error", errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   };

   useEffect(() => {
      if (images.length > 0) {
         setValue("media", images);
      }
   }, [images, setValue]);

   // New Modal Dropdown component
   const ModalDropdown = ({ value, onChange, items, placeholder }: any) => {
      const [modalVisible, setModalVisible] = useState(false);

      const getSelectedLabel = () => {
         const selected = items.find(
            (item: DropdownItem) => item.value === value
         );
         return selected ? selected.label : placeholder;
      };

      return (
         <>
            <TouchableOpacity
               style={[
                  styles.selectButton,
                  { borderColor: errors.incidentType ? "#D32F2F" : "#E0E0E0" },
               ]}
               onPress={() => setModalVisible(true)}
            >
               <Text
                  style={
                     value
                        ? styles.dropdownButtonText
                        : styles.dropdownButtonPlaceholder
                  }
               >
                  {getSelectedLabel()}
               </Text>
               <Text style={styles.chevronDown}>▼</Text>
            </TouchableOpacity>

            <Modal
               visible={modalVisible}
               transparent={true}
               animationType="slide"
               onRequestClose={() => setModalVisible(false)}
            >
               <View style={styles.modalContainer}>
                  <SafeAreaView style={styles.modalContent}>
                     <Text style={styles.modalHeader}>
                        Select Incident Type
                     </Text>
                     <FlatList
                        data={items}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                           <TouchableOpacity
                              style={styles.modalItem}
                              onPress={() => {
                                 onChange(item.value);
                                 setModalVisible(false);
                              }}
                           >
                              <Text style={styles.modalItemText}>
                                 {item.label}
                              </Text>
                           </TouchableOpacity>
                        )}
                     />
                     <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setModalVisible(false)}
                     >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                     </TouchableOpacity>
                  </SafeAreaView>
               </View>
            </Modal>
         </>
      );
   };

   return (
      <Theme name="light">
         <ScrollView style={styles.container}>
            <View style={{ paddingBottom: 40 }}>
               <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>Crime Report Form</Text>
               </View>

               <View>
                  <YStack space="$4" paddingBottom={50}>
                     {/* Incident Type Dropdown - Modal implementation */}
                     <View style={styles.formSection}>
                        <Controller
                           name="incidentType"
                           control={control}
                           render={({ field }) => (
                              <YStack>
                                 <Text style={styles.label}>
                                    Incident Type *
                                 </Text>
                                 <ModalDropdown
                                    value={field.value}
                                    onChange={field.onChange}
                                    items={incidentTypes}
                                    placeholder="Select incident type"
                                 />
                                 {errors.incidentType && (
                                    <Text style={styles.errorText}>
                                       Please select an incident type
                                    </Text>
                                 )}
                              </YStack>
                           )}
                        />
                     </View>

                     {/* Date/Time Picker */}
                     <View style={styles.formSection}>
                        <Controller
                           name="dateTime"
                           control={control}
                           render={({ field }) => (
                              <YStack>
                                 <Text style={styles.label}>
                                    When did it happen? *
                                 </Text>
                                 <Button
                                    style={[
                                       styles.selectButton,
                                       {
                                          borderColor: errors.dateTime
                                             ? "#D32F2F"
                                             : "#E0E0E0",
                                       },
                                    ]}
                                    onPress={() => {
                                       setMode("date");
                                       setShowDatePicker(true);
                                    }}
                                 >
                                    <Text style={styles.dropdownButtonText}>
                                       {field.value
                                          ? field.value.toLocaleString()
                                          : "Select Date & Time"}
                                    </Text>
                                 </Button>

                                 {showDatePicker && (
                                    <DateTimePicker
                                       value={field.value || new Date()}
                                       mode={
                                          Platform.OS === "ios"
                                             ? "datetime"
                                             : mode
                                       }
                                       display="default"
                                       onChange={(event, selectedDate) => {
                                          setShowDatePicker(false);
                                          if (selectedDate) {
                                             if (
                                                Platform.OS === "android" &&
                                                mode === "date"
                                             ) {
                                                setMode("time");
                                                setShowDatePicker(true);
                                             }
                                             field.onChange(selectedDate);
                                          }
                                       }}
                                    />
                                 )}
                                 {errors.dateTime && (
                                    <Text style={styles.errorText}>
                                       {errors.dateTime.message ||
                                          "Valid date and time required"}
                                    </Text>
                                 )}
                              </YStack>
                           )}
                        />
                     </View>

                     {/* Location Input */}
                     <View style={styles.formSection}>
                        <Controller
                           name="location.address"
                           control={control}
                           render={({ field }) => (
                              <YStack>
                                 <Text style={styles.label}>Location *</Text>
                                 <Input
                                    style={styles.input}
                                    placeholder="Enter address or location description"
                                    value={field.value}
                                    onChangeText={field.onChange}
                                 />
                                 <View style={{ marginTop: 10 }}>
                                    <Button
                                       style={{
                                          ...styles.button,
                                          backgroundColor: "#B71C1C",
                                       }}
                                       onPress={handleLocation}
                                    >
                                       <Text style={styles.buttonText}>
                                          Use Current Location
                                       </Text>
                                    </Button>
                                 </View>
                                 {errors.location?.address && (
                                    <Text style={styles.errorText}>
                                       {errors.location.address.message ||
                                          "Valid location required"}
                                    </Text>
                                 )}
                              </YStack>
                           )}
                        />
                     </View>

                     {/* Description */}
                     <View style={styles.formSection}>
                        <Controller
                           name="description"
                           control={control}
                           render={({ field }) => (
                              <YStack>
                                 <Text style={styles.label}>
                                    Incident Description *
                                 </Text>
                                 <TextArea
                                    style={{ ...styles.input, minHeight: 120 }}
                                    placeholder="Please provide a detailed description of what happened..."
                                    value={field.value || ""}
                                    onChangeText={field.onChange}
                                 />
                                 {errors.description && (
                                    <Text style={styles.errorText}>
                                       {errors.description.message ||
                                          "Description required (50-500 characters)"}
                                    </Text>
                                 )}
                              </YStack>
                           )}
                        />
                     </View>

                     {/* Image Upload */}
                     <View style={styles.formSection}>
                        <YStack>
                           <Text style={styles.label}>
                              Evidence Photos (Optional)
                           </Text>
                           <XStack space="$2">
                              <Button
                                 style={styles.button}
                                 onPress={() => pickImage(true)}
                              >
                                 <Text style={styles.buttonText}>
                                    Take Photo
                                 </Text>
                              </Button>
                              <Button
                                 style={styles.button}
                                 onPress={() => pickImage(false)}
                              >
                                 <Text style={styles.buttonText}>
                                    Choose Photos
                                 </Text>
                              </Button>
                           </XStack>
                           <View style={styles.imageGrid}>
                              {images.map((uri, index) => (
                                 <Image
                                    key={index}
                                    source={{ uri }}
                                    style={styles.thumbnail}
                                 />
                              ))}
                           </View>
                        </YStack>
                     </View>

                     {/* Anonymous Checkbox Section */}
                     <View style={styles.formSection}>
                        <Controller
                           name="anonymous"
                           control={control}
                           render={({ field }) => (
                              <TouchableOpacity
                                 onPress={() => field.onChange(!field.value)}
                                 accessible={true}
                                 accessibilityLabel="Submit report anonymously"
                                 accessibilityRole="checkbox"
                              >
                                 <XStack
                                    alignItems="center"
                                    space="$2"
                                    paddingVertical={8}
                                 >
                                    <Checkbox
                                       checked={field.value}
                                       size="$4"
                                       backgroundColor={
                                          field.value ? "#B71C1C" : "#E0E0E0"
                                       }
                                       borderColor={
                                          field.value ? "#B71C1C" : "#E0E0E0"
                                       }
                                    >
                                       <Checkbox.Indicator backgroundColor="white" />
                                    </Checkbox>
                                    <Text
                                       style={{
                                          ...styles.label,
                                          marginBottom: 0,
                                       }}
                                    >
                                       Submit Report Anonymously
                                    </Text>
                                 </XStack>
                              </TouchableOpacity>
                           )}
                        />
                     </View>

                     <Button
                        style={styles.button}
                        onPress={handleSubmit((data) => {
                           console.log("Button pressed, data:", data); // Debug log
                           onSubmit(data);
                        })}
                        disabled={isSubmitting}
                     >
                        <Text style={styles.buttonText}>
                           {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
                        </Text>
                     </Button>

                     {submitError && (
                        <Text
                           style={{
                              ...styles.errorText,
                              textAlign: "center",
                              marginVertical: 10,
                           }}
                        >
                           {submitError}
                        </Text>
                     )}
                  </YStack>
               </View>
            </View>
         </ScrollView>
      </Theme>
   );
}
