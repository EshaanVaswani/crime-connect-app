import {
   Linking,
   View,
   Text,
   StyleSheet,
   Image,
   Dimensions,
   TouchableOpacity,
   ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";

type ResourceItem = {
   title: string;
   videoId: string;
   icon: React.ComponentProps<typeof Ionicons>["name"];
};

type ResourceCategory = {
   title: string;
   items: ResourceItem[];
};

const resourcesData: ResourceCategory[] = [
   {
      title: "Self-Defense Training",
      items: [
         { title: "Basic Techniques", videoId: "B725c7vi1xk", icon: "body" },
         { title: "Street Awareness", videoId: "aq3mnDRVIq0", icon: "walk" },
         { title: "Women's Safety", videoId: "q1pBBRi3XF8", icon: "female" },
         { title: "Krav Maga Basics", videoId: "-Y4OujZ63UE", icon: "shield" },
      ],
   },
   {
      title: "Legal Procedures",
      items: [
         {
            title: "File Police Report",
            videoId: "341J0Ev9OWw",
            icon: "document-text",
         },
         {
            title: "Know Your Rights",
            videoId: "K65DEXrR9As",
            icon: "shield-checkmark",
         },
         {
            title: "Court Preparation",
            videoId: "_rNlZH-5R48",
            icon: "business",
         },
         { title: "Victim Support", videoId: "ZCdSaKwhk5Q", icon: "heart" },
      ],
   },
   {
      title: "Emergency Response",
      items: [
         { title: "First Aid Basics", videoId: "mNk0mZRJBV0", icon: "medkit" },
         { title: "Active Shooter", videoId: "DFQ-oxhdFjE", icon: "alert" },
         { title: "Fire Safety", videoId: "7CzvIArUrRw", icon: "flame" },
         { title: "Earthquake Prep", videoId: "BLEPakj1YTY", icon: "earth" },
      ],
   },
   {
      title: "Digital Security",
      items: [
         {
            title: "Data Protection",
            videoId: "soliOHbzJog",
            icon: "lock-closed",
         },
         { title: "Cyber Threats", videoId: "awhqnSskWjU", icon: "bug" },
         { title: "Secure Comms", videoId: "apLxePngNlM", icon: "chatbubbles" },
         { title: "Fraud Prevention", videoId: "3MC0wVM7DxE", icon: "card" },
      ],
   },
];

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.8;
const ITEM_HEIGHT = 200;

export default function ResourcesScreen() {
   const handlePress = (videoId: string) => {
      Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
   };

   return (
      <ScrollView style={styles.container}>
         <View style={styles.header}>
            <Text style={styles.headerTitle}>Resources</Text>
            <Ionicons name="book" size={28} color="#B71C1C" />
         </View>

         {resourcesData.map((category, index) => (
            <View key={index} style={styles.section}>
               <Text style={styles.sectionTitle}>{category.title}</Text>

               <Carousel
                  loop
                  width={ITEM_WIDTH}
                  height={ITEM_HEIGHT}
                  data={category.items}
                  mode="parallax"
                  modeConfig={{
                     parallaxScrollingScale: 0.9,
                     parallaxScrollingOffset: 50,
                  }}
                  renderItem={({ item }) => (
                     <TouchableOpacity
                        style={styles.item}
                        onPress={() => handlePress(item.videoId)}
                     >
                        <Image
                           source={{
                              uri: `https://img.youtube.com/vi/${item.videoId}/0.jpg`,
                           }}
                           style={styles.thumbnail}
                        />
                        <View style={styles.itemContent}>
                           <Ionicons
                              name={item.icon}
                              size={24}
                              color="#B71C1C"
                           />
                           <Text style={styles.itemTitle}>{item.title}</Text>
                        </View>
                        <View style={styles.pagination}>
                           {category.items.map((_, i) => (
                              <View
                                 key={i}
                                 style={[
                                    styles.paginationDot,
                                    item === category.items[i] &&
                                       styles.activeDot,
                                 ]}
                              />
                           ))}
                        </View>
                     </TouchableOpacity>
                  )}
               />
            </View>
         ))}
      </ScrollView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 16,
   },
   header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingHorizontal: 16,
   },
   headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: "#B71C1C",
   },
   section: {
      marginBottom: 40,
   },
   sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#B71C1C",
      marginBottom: 20,
      paddingLeft: 10,
   },
   item: {
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#fff",
      marginHorizontal: 10,
      elevation: 3,
   },
   thumbnail: {
      width: "100%",
      height: ITEM_HEIGHT - 80,
      backgroundColor: "#f5f5f5",
   },
   itemContent: {
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "#fff",
   },
   itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      flexShrink: 1,
   },
   pagination: {
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 10,
   },
   paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#D3D3D3",
      marginHorizontal: 4,
   },
   activeDot: {
      backgroundColor: "#B71C1C",
   },
});
