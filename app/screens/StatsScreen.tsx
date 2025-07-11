// app/screens/StatsScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLineup } from '../context/LineupContext'

export default function StatsScreen() {
  const { lineup } = useLineup()
  const team = lineup.opponentName || 'Opponent'

  const [expandedRotation, setExpandedRotation] = useState<number | null>(
    null
  )
  const [rotationProbabilities, setRotationProbabilities] = useState<
    number[][]
  >(Array(6).fill([33, 33, 34]))
  const [opponentName, setOpponentName] = useState(team)

  // Sync displayed opponent name
  useEffect(() => {
    setOpponentName(lineup.opponentName || 'Opponent')
  }, [lineup.opponentName])

  // Load scouting data & compute %
  useEffect(() => {
    async function loadAndCompute() {
      try {
        const raw = await AsyncStorage.getItem(`scout_${team}`)
        if (raw) {
          const saved = JSON.parse(raw) // <-- removed the inline type here
          const probs = [1, 2, 3, 4, 5, 6].map((rot) => {
            const oppHitters = getFrontRowHitters(rot).opponent
            const counts = oppHitters.map((h) => {
              const rec = saved[rot]?.[h.number] ?? {
                kills: { total: 0 },
                errors: { total: 0 },
                attempts: { total: 0 },
              }
              return (
                rec.kills.total + rec.errors.total + rec.attempts.total
              )
            })
            const total = counts.reduce((a, b) => a + b, 0)
            if (total === 0) return [33, 33, 34]
            const p0 = Math.floor((counts[0] * 100) / total)
            const p1 = Math.floor((counts[1] * 100) / total)
            return [p0, p1, 100 - p0 - p1]
          })
          setRotationProbabilities(probs)
          return
        }
      } catch (e) {
        console.error('Failed to load scouting data', e)
      }
      setRotationProbabilities(Array(6).fill([33, 33, 34]))
    }
    loadAndCompute()
  }, [team, lineup.opponentName])

  // Helper: adjust Rams rotation based on startingRotation & who serves first
  const getAdjustedRotation = (rotation: number) => {
    const ramsStart = parseInt(lineup.startingRotation.rams, 10)
    const oppStart = parseInt(lineup.startingRotation.opponent, 10)
    const serves = lineup.servingFirst
    const offset = (ramsStart - oppStart + 6) % 6
    return serves === 'Opponent'
      ? ((rotation + offset - 1 + 6) % 6) + 1
      : ((rotation + offset - 2 + 6) % 6) + 1
  }

  // Pull front‐row for both teams
  const getFrontRowHitters = (rotation: number) => {
    const O = lineup.opponent
    const R = lineup.rams
    const oppRotations = [
      [O.OH1, O.MB1, O.RS1],
      [O.OH2, O.MB1, O.RS1],
      [O.OH2, O.MB2, O.RS1],
      [O.OH2, O.MB2, O.RS2],
      [O.OH1, O.MB2, O.RS2],
      [O.OH1, O.MB1, O.RS2],
    ]
    const ramsRotations = [
      [R.RS1, R.MB1, R.OH1],
      [R.RS1, R.MB1, R.OH2],
      [R.RS1, R.MB2, R.OH2],
      [R.RS2, R.MB2, R.OH2],
      [R.RS2, R.MB2, R.OH1],
      [R.RS2, R.MB1, R.OH1],
    ]

    const opp = oppRotations[rotation - 1].map((p) => ({
      number: p?.number ?? '?',
    }))
    const rams = ramsRotations[getAdjustedRotation(rotation) - 1].map((p) => ({
      number: p?.number ?? '?',
    }))
    return { opponent: opp, rams }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.opponentNameInput}
        placeholder="Enter Opponent Name"
        value={opponentName}
        onChangeText={(t) => setOpponentName(t)}
      />
      <Text style={styles.title}>
        {opponentName} Front Row by Rotation
      </Text>

      <View style={styles.tableContainer}>
        {[1, 2, 3, 4, 5, 6].map((rotation) => {
          const { opponent, rams } = getFrontRowHitters(rotation)
          const probs = rotationProbabilities[rotation - 1]
          return (
            <View
              key={rotation}
              style={[
                styles.rotationCard,
                rotation % 2 === 0
                  ? styles.evenRotation
                  : styles.oddRotation,
                expandedRotation === rotation && styles.expandedCard,
                expandedRotation !== null &&
                  expandedRotation !== rotation &&
                  styles.dimmedCard,
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  setExpandedRotation(
                    expandedRotation === rotation ? null : rotation
                  )
                }
              >
                <Text style={styles.rotationTitle}>
                  Rotation {rotation}
                </Text>
                <View style={styles.hitterInfo}>
                  {opponent.map((h, i) => (
                    <Text key={i} style={styles.hitterText}>
                      #{h.number} – {probs[i]}%
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>

              {expandedRotation === rotation && (
                <View style={styles.expandedContainer}>
                  <View style={styles.teamRow}>
                    {rams.map((p, i) => (
                      <Text
                        key={i}
                        style={[styles.playerText, styles.ramsText]}
                      >
                        #{p.number}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.netExpanded} />

                  <View style={styles.teamRow}>
                    {opponent.map((p, i) => (
                      <Text key={i} style={styles.playerText}>
                        #{p.number}: {probs[i]}%
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  opponentNameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rotationCard: {
    width: '48%',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  evenRotation: { backgroundColor: '#d3e0e9' },
  oddRotation: { backgroundColor: '#e0f7f3' },
  dimmedCard: { opacity: 0.3 },
  rotationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  hitterInfo: { marginBottom: 10 },
  hitterText: { fontSize: 16, color: '#333' },
  expandedCard: {
    width: '100%',
    backgroundColor: '#d0e9d0',
    paddingVertical: 20,
  },
  expandedContainer: {
    marginTop: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  playerText: {
    fontSize: 18,
    color: '#333',
    marginHorizontal: 12,
    fontWeight: 'bold',
  },
  ramsText: {
    color: '#523178',
    fontWeight: 'bold',
  },
  netExpanded: {
    height: 3,
    width: '80%',
    backgroundColor: '#333',
    alignSelf: 'center',
    marginVertical: 16,
  },
})
