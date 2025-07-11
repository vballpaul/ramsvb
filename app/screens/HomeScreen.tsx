import React from 'react'; // Import React
import { View, Text, StyleSheet } from 'react-native'; // Import necessary components from react-native

// Define the HomeScreen component
const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Home Screen!</Text>
    </View>
  );
};

// Add styles to the component using StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    backgroundColor: '#f0f0f0', // Light gray background
  },
  text: {
    fontSize: 20, // Font size for the text
    fontWeight: 'bold', // Make the text bold
  },
});

// Export the component so it can be used elsewhere
export default HomeScreen;
