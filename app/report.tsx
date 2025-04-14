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
      formState: { errors },
   } = useForm({
      resolver: zodResolver(reportSchema),
      defaultValues: {
         anonymous: false,
         location: { address: "" },
         media: [],
      },
   });

   const [images, setImages] = useState<string[]>([]);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [date, setDate] = useState(new Date());
   const [mode, setMode] = useState<"date" | "time">("date");
   const [dropdownOpen, setDropdownOpen] = useState(false);

   const pickImage = async () => {
      const { status } =
         await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
         Alert.alert(
            "Permission needed",
            "We need access to your photos to upload images."
         );
         return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: "images",
         allowsEditing: true,
         quality: 0.7,
      });

      if (!result.canceled && result.assets) {
         const newImages = [...images, result.assets[0].uri];
         setImages(newImages);
         setValue("media", newImages);
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

   const onSubmit = (data: any) => {
      console.log("Form submitted:", data);
      Alert.alert(
         "Report Submitted",
         "Thank you for your report. Authorities have been notified.",
         [{ text: "OK" }]
      );
      // In a real app, you would send this data to your backend
   };

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

               <Form onSubmit={handleSubmit(onSubmit)}>
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

                                 {Platform.OS === "ios"
                                    ? // iOS implementation
                                      showDatePicker && (
                                         <DateTimePicker
                                            value={date}
                                            mode="datetime"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                               setShowDatePicker(false);
                                               if (selectedDate) {
                                                  setDate(selectedDate);
                                                  field.onChange(selectedDate);
                                               }
                                            }}
                                         />
                                      )
                                    : // Android implementation
                                      showDatePicker && (
                                         <DateTimePicker
                                            value={date}
                                            mode={mode}
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                               setShowDatePicker(false);
                                               if (selectedDate) {
                                                  if (mode === "date") {
                                                     // Save the date and show time picker
                                                     const newDate = new Date(
                                                        selectedDate
                                                     );
                                                     setDate(newDate);
                                                     // Show time picker after selecting date
                                                     setMode("time");
                                                     setShowDatePicker(true);
                                                  } else {
                                                     // After time is selected
                                                     const newDateTime =
                                                        new Date(date);
                                                     newDateTime.setHours(
                                                        selectedDate.getHours()
                                                     );
                                                     newDateTime.setMinutes(
                                                        selectedDate.getMinutes()
                                                     );
                                                     setDate(newDateTime);
                                                     field.onChange(
                                                        newDateTime
                                                     );
                                                  }
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
                           <Button
                              style={{
                                 ...styles.button,
                                 backgroundColor: "#B71C1C",
                              }}
                              onPress={pickImage}
                           >
                              <Text style={styles.buttonText}>Add Photo</Text>
                           </Button>
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
                        onPress={handleSubmit(onSubmit)}
                     >
                        <Text style={styles.buttonText}>SUBMIT REPORT</Text>
                     </Button>
                  </YStack>
               </Form>
            </View>
         </ScrollView>
      </Theme>
   );
}
