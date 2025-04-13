import { Button, H1, Paragraph, XStack, YStack } from "tamagui";
import { useRouter } from "expo-router";

export default function LandingPage() {
   const router = useRouter();

   return (
      <YStack flex={1} padding="$4" space="$4">
         <H1 color="$blue10">Community Crime Watch</H1>
         <Paragraph>
            Report crimes, connect with neighbors, and make your community
            safer.
         </Paragraph>

         <XStack space="$2">
            <Button theme="active" onPress={() => router.push("/report")}>
               Report Incident
            </Button>
            <Button onPress={() => router.push("/community")}>
               Join Community
            </Button>
         </XStack>

         {/* Recent Activity Section */}
         <YStack marginTop="$6">
            <H1 fontSize="$5">Recent Activity</H1>
            {/* Add your community feed components here */}
         </YStack>

         <YStack
            backgroundColor="$landingBg"
            padding="$6"
            borderRadius="$4"
            marginBottom="$4"
         >
            <H1 fontSize="$8">Your Safety Matters</H1>
            <Paragraph>
               Join 5,000+ neighbors keeping our community safe
            </Paragraph>
         </YStack>
      </YStack>
   );
}
