import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useTendencies } from '../context/TendenciesContext';
import { useLineup } from '../context/LineupContext';

export default function TendenciesScreen() {
  const { tendencies, saveTendencies } = useTendencies();
  const { lineup } = useLineup();
  
  const [rotation, setRotation] = useState(1);
  const [OH, setOH] = useState(0);
  const [MB, setMB] = useState(0);
  const [RS, setRS] = useState(0);

  const handleSave = () => {
    saveTendencies(lineup.opponentName, rotation, { OH, MB, RS });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Tendencies</Text>
      
      <Text>Rotation:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={rotation.toString()}
        onChangeText={(text) => setRotation(parseInt(text) || 1)}
      />

      <Text>OH %:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={OH.toString()}
        onChangeText={(text) => setOH(parseInt(text) || 0)}
      />

      <Text>MB %:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={MB.toString()}
        onChangeText={(text) => setMB(parseInt(text) || 0)}
      />

      <Text>RS %:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={RS.toString()}
        onChangeText={(text) => setRS(parseInt(text) || 0)}
      />

      <Button title="Save" onPress={handleSave} />

      <Text style={styles.tendencyTitle}>Saved Data:</Text>
      <Text>{JSON.stringify(tendencies, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  tendencyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});

console.log("Saved tendencies:", JSON.stringify(tendencies, null, 2));
