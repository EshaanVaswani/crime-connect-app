import { ScrollView, YStack, XStack, Text, Avatar, Theme } from "tamagui";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  header: {
    color: "#B71C1C",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
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
    fontSize: 18,
    color: "#424242",
    fontWeight: "500",
    marginBottom: 20,
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
});

const ProfileScreen = () => {
  // Dummy data - replace with actual user data
  const user = {
    phone: "(509) 852-4382",
    emergencyContacts: [
      { name: "Ralph E. Schroeder", number: "(503) 989-8403" },
      { name: "Nicholas J. White", number: "(505) 932-5852" },
      { name: "Shelley M. Wilson", number: "(509) 746-6914" },
    ],
    reportedIncidents: [
      { type: "Theft", date: "2024-03-15", status: "Under Investigation" },
      { type: "Vandalism", date: "2024-03-12", status: "Case Closed" },
      { type: "Suspicious Activity", date: "2024-03-10", status: "Pending Review" },
    ]
  };

  return (
    <Theme name="light">
      <ScrollView style={styles.container}>
        {/* User Profile Section */}
        <YStack style={styles.section}>
          <XStack alignItems="center" gap={16} marginBottom={20}>
            <Avatar circular size={60}>
              <Avatar.Image src="https://placehold.co/60x60" />
              <Avatar.Fallback backgroundColor="#E0E0E0" />
            </Avatar>
            <YStack>
              <Text style={styles.phoneNumber}>{user.phone}</Text>
              <Text style={styles.label}>Registered Phone Number</Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Emergency Contacts Section */}
        <YStack style={styles.section}>
          <Text style={styles.header}>Emergency Contacts</Text>
          {user.emergencyContacts.map((contact, index) => (
            <XStack key={index} style={styles.contactItem}>
              <MaterialCommunityIcons 
                name="account-alert" 
                size={24} 
                color="#B71C1C" 
                style={{ marginRight: 12 }}
              />
              <YStack>
                <Text style={styles.value} fontWeight="500">{contact.name}</Text>
                <Text style={styles.value}>{contact.number}</Text>
              </YStack>
            </XStack>
          ))}
        </YStack>

        {/* Reported Incidents Section */}
        <YStack style={styles.section}>
          <Text style={styles.header}>Your Reported Incidents</Text>
          {user.reportedIncidents.map((incident, index) => (
            <YStack key={index} style={styles.incidentItem}>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text style={styles.value} fontWeight="500">{incident.type}</Text>
                  <Text style={styles.label}>{incident.date}</Text>
                </YStack>
                <XStack alignItems="center" gap={8}>
                  <MaterialCommunityIcons 
                    name={incident.status === "Case Closed" ? "check-circle" : "clock"} 
                    size={20} 
                    color={incident.status === "Case Closed" ? "#388E3C" : "#B71C1C"} 
                  />
                  <Text style={[styles.value, { 
                    color: incident.status === "Case Closed" ? "#388E3C" : "#B71C1C"
                  }]}>
                    {incident.status}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </Theme>
  );
};

export default ProfileScreen;