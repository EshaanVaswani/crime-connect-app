import { useState, useEffect } from "react";
import { View, Modal, StyleSheet, Alert, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { YStack, Text, Button, Theme, Card, ScrollView } from "tamagui";
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      latitude: 19.2403,
      longitude: 73.1305,
    },
    date: "2024-03-20 14:30",
    description: "Stolen bicycle from parking rack",
    status: "Under Investigation",
    reporter: "Anonymous"
  },
  // Add more crimes as needed
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

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
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

  // Marker color based on crime type
  const getMarkerColor = (type: string) => {
    const colors = {
      theft: '#B71C1C',
      assault: '#D32F2F',
      default: '#B71C1C'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  if (locationError) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding={20}>
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
        {region ? (
          <MapView
            style={styles.map}
            initialRegion={region}
            // provider prop removed as "openstreetmap" is not valid
            showsUserLocation={true}
          >
            {/* User Location */}
            <Marker coordinate={region}>
              <MaterialCommunityIcons name="account" size={28} color="#2196F3" />
            </Marker>

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
                  color={getMarkerColor(crime.type)} 
                />
              </Marker>
            ))}
          </MapView>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text>Loading crime map...</Text>
          </YStack>
        )}

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
                  <Text fontSize={20} fontWeight="bold" color="#B71C1C">
                    {selectedCrime?.title}
                  </Text>
                  
                  <YStack>
                    <Text width={100} color="#757575">Type:</Text>
                    <Text color="#424242">{selectedCrime?.type}</Text>
                  </YStack>
                  
                  <YStack>
                    <Text width={100} color="#757575">Date:</Text>
                    <Text color="#424242">{selectedCrime?.date}</Text>
                  </YStack>
                  
                  <YStack>
                    <Text width={100} color="#757575">Status:</Text>
                    <Text color="#B71C1C">{selectedCrime?.status}</Text>
                  </YStack>
                  
                  <YStack>
                    <Text color="#757575">Description:</Text>
                    <Text color="#424242">{selectedCrime?.description}</Text>
                  </YStack>
                  
                  <Button 
                    theme="active" 
                    marginTop={16}
                    onPress={() => setSelectedCrime(null)}
                  >
                    Close Details
                  </Button>
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
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  button: {
    backgroundColor: '#B71C1C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});