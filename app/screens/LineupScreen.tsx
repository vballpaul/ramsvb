import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLineup } from '../context/LineupContext';
import { useTendencies } from '../context/TendenciesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LineupScreen() {
  const { lineup, setLineup } = useLineup();
  const { loadTendencies } = useTendencies();

  const [startingRotationRams, setStartingRotationRams] = useState('1');
  const [startingRotationOpponent, setStartingRotationOpponent] = useState('1');
  const [servingFirst, setServingFirst] = useState<'Rams' | 'Opponent'>('Rams');
  const [opponentName, setOpponentName] = useState(lineup.opponentName || '');

  // Load saved lineup when component mounts
  useEffect(() => {
    const loadSavedLineup = async () => {
      try {
        const savedLineup = await AsyncStorage.getItem('savedLineup');
        if (savedLineup) {
          setLineup(JSON.parse(savedLineup));
        }
      } catch (error) {
        console.error('Failed to load saved lineup:', error);
      }
    };
    loadSavedLineup();
  }, []);

  // Save lineup whenever it updates
  useEffect(() => {
    const saveLineup = async () => {
      try {
        await AsyncStorage.setItem('savedLineup', JSON.stringify(lineup));
      } catch (error) {
        console.error('Failed to save lineup:', error);
      }
    };
    saveLineup();
  }, [lineup]);

  // Load tendencies when opponent name is entered
  const handleOpponentChange = (text: string) => {
    setOpponentName(text);
    if (text.trim() !== '') {
      loadTendencies(text.trim()); // Load tendencies for the opponent
    }
  };

  const handleUpdateLineup = () => {
    setLineup({
      ...lineup,
      startingRotation: {
        rams: startingRotationRams,
        opponent: startingRotationOpponent,
      },
      servingFirst: servingFirst,
      opponentName: opponentName || 'Opponent', // Reset to default if empty
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Lineups</Text>

      <View style={styles.lineupContainer}>
        {/* Rams Inputs */}
        <View style={styles.teamSection}>
          <Text style={styles.subTitle}>Rams</Text>
          {['OH1', 'OH2', 'MB1', 'MB2', 'RS1', 'RS2'].map((position) => (
            <View key={position} style={styles.inputContainer}>
              <Text style={styles.positionLabel}>{position}:</Text>
              <TextInput
                value={lineup.rams[position]?.number || ''}
                onChangeText={(text) =>
                  setLineup({
                    ...lineup,
                    rams: { ...lineup.rams, [position]: { number: text } },
                  })
                }
                placeholder="#"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          ))}
          {/* Starting Rotation for Rams */}
          <View style={styles.inputContainer}>
            <Text style={styles.positionLabel}>Starting Rotation:</Text>
            <TextInput
              value={startingRotationRams}
              onChangeText={setStartingRotationRams}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        {/* Opponent Inputs */}
        <View style={styles.teamSection}>
          <TextInput
            style={styles.opponentNameInput}
            value={opponentName}
            onChangeText={handleOpponentChange}
            placeholder="Opponent"
            onFocus={() => opponentName === 'Opponent' && setOpponentName('')}
            onBlur={() => setOpponentName(opponentName.trim() === '' ? 'Opponent' : opponentName)}
          />
          {['OH1', 'OH2', 'MB1', 'MB2', 'RS1', 'RS2'].map((position) => (
            <View key={position} style={styles.inputContainer}>
              <Text style={styles.positionLabel}>{position}:</Text>
              <TextInput
                value={lineup.opponent[position]?.number || ''}
                onChangeText={(text) =>
                  setLineup({
                    ...lineup,
                    opponent: { ...lineup.opponent, [position]: { number: text } },
                  })
                }
                placeholder="#"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          ))}
          {/* Starting Rotation for Opponent */}
          <View style={styles.inputContainer}>
            <Text style={styles.positionLabel}>Starting Rotation:</Text>
            <TextInput
              value={startingRotationOpponent}
              onChangeText={setStartingRotationOpponent}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {/* Serving First Selection */}
      <View style={styles.servingSection}>
        <Text style={styles.positionLabel}>Serving First:</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity onPress={() => setServingFirst('Rams')} style={styles.radioButton}>
            <View style={[styles.radioCircle, servingFirst === 'Rams' && styles.radioSelected]} />
            <Text style={styles.radioText}>Rams</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setServingFirst('Opponent')} style={styles.radioButton}>
            <View style={[styles.radioCircle, servingFirst === 'Opponent' && styles.radioSelected]} />
            <Text style={styles.radioText}>Opponent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Update Button */}
      <Button title="Update Lineup" onPress={handleUpdateLineup} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  lineupContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  teamSection: { flex: 1, paddingHorizontal: 10 },
  subTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  positionLabel: { fontSize: 16, fontWeight: 'bold', width: 80 },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 60,
    textAlign: 'center',
  },
  opponentNameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  servingSection: { marginTop: 20, alignItems: 'center' },
  radioGroup: { flexDirection: 'row', marginTop: 10 },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: '#523178' }, // Purple when selected
  radioText: { marginLeft: 5, fontSize: 16 },
});
