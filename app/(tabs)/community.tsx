import { useState } from "react";
import {
   ScrollView,
   YStack,
   XStack,
   Text,
   Input,
   Button,
   Avatar,
   Theme,
} from "tamagui";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#F5F5F5",
   },
   header: {
      backgroundColor: "#B71C1C",
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
   },
   postContainer: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E0E0E0",
   },
   inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
   },
   input: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 8,
      padding: 12,
      backgroundColor: "white",
   },
   voteButton: {
      padding: 6,
      borderRadius: 8,
   },
   voteCount: {
      color: "#424242",
      fontWeight: "600",
      marginHorizontal: 8,
   },
   timestamp: {
      color: "#757575",
      fontSize: 12,
      marginTop: 8,
   },
   anonymousName: {
      color: "#B71C1C",
      fontWeight: "500",
      marginBottom: 4,
   },
   button: {
      backgroundColor: "#B71C1C",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
   },
});

const CommunityScreen = () => {
   const [newMessage, setNewMessage] = useState("");
   const [posts, setPosts] = useState([
      {
         id: 1,
         content: "Suspicious activity near Main St. Park around 9PM",
         upvotes: 15,
         downvotes: 2,
         timestamp: "2h ago",
         user: "VigilantCitizen42",
      },
      {
         id: 2,
         content: "Lost wallet in downtown area, reward if found",
         upvotes: 8,
         downvotes: 1,
         timestamp: "4h ago",
         user: "SafeNeighbor99",
      },
   ]);

   const handleVote = (postId: number, isUpvote: boolean) => {
      setPosts(
         posts.map((post) => {
            if (post.id === postId) {
               return {
                  ...post,
                  upvotes: isUpvote ? post.upvotes + 1 : post.upvotes,
                  downvotes: !isUpvote ? post.downvotes + 1 : post.downvotes,
               };
            }
            return post;
         })
      );
   };

   const handleSend = () => {
      if (newMessage.trim()) {
         setPosts([
            {
               id: posts.length + 1,
               content: newMessage,
               upvotes: 0,
               downvotes: 0,
               timestamp: "Just now",
               user: `User${Math.floor(Math.random() * 1000)}`,
            },
            ...posts,
         ]);
         setNewMessage("");
      }
   };

   return (
      <Theme name="light">
         <ScrollView style={styles.container}>
            <YStack>
               <YStack style={styles.header}>
                  <Text color="white" fontSize={20} fontWeight="bold">
                     Community Alerts
                  </Text>
                  <Text color="white" marginTop={4} fontSize={14}>
                     Share safety updates with neighbors
                  </Text>
               </YStack>

               {posts.map((post) => (
                  <YStack key={post.id} style={styles.postContainer}>
                     <XStack alignItems="center" gap={8} marginBottom={8}>
                        <Avatar circular size={40}>
                           <Avatar.Image src="https://placehold.co/40x40" />
                           <Avatar.Fallback backgroundColor="#E0E0E0" />
                        </Avatar>
                        <Text style={styles.anonymousName}>{post.user}</Text>
                     </XStack>

                     <Text color="#424242" fontSize={14}>
                        {post.content}
                     </Text>

                     <XStack alignItems="center" marginTop={12}>
                        <Button
                           style={styles.voteButton}
                           icon={
                              <MaterialCommunityIcons
                                 name="arrow-up-bold"
                                 size={20}
                                 color="#B71C1C"
                              />
                           }
                           onPress={() => handleVote(post.id, true)}
                        />
                        <Text style={styles.voteCount}>
                           {post.upvotes - post.downvotes}
                        </Text>
                        <Button
                           style={styles.voteButton}
                           icon={
                              <MaterialCommunityIcons
                                 name="arrow-down-bold"
                                 size={20}
                                 color="#757575"
                              />
                           }
                           onPress={() => handleVote(post.id, false)}
                        />
                        <Text
                           style={[styles.timestamp, { marginLeft: "auto" }]}
                        >
                           {post.timestamp}
                        </Text>
                     </XStack>
                  </YStack>
               ))}
            </YStack>
         </ScrollView>

         <YStack style={styles.inputContainer} padding={16}>
            <Input
               style={styles.input}
               placeholder="Post safety update..."
               value={newMessage}
               onChangeText={setNewMessage}
            />
            <Button
               icon={
                  <MaterialCommunityIcons
                     name="send-circle"
                     size={24}
                     color="white"
                  />
               }
               style={styles.button}
               onPress={handleSend}
            >
               Post
            </Button>
         </YStack>
      </Theme>
   );
};

export default CommunityScreen;
