import { Button, View, Text } from 'tamagui';

export default function ProfileScreen() {
  return (
    <View flex={1} padding="$4">
      <Text>Your Profile</Text>
      <Button>Edit Profile</Button>
      <Text>Additional Information</Text>
    </View>
  );
}