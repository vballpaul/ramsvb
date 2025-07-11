import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLineup } from '../context/LineupContext';

// Type defs
type StatDetail =
  | 'blocked'
  | 'out'
  | 'net'
  | 'tool'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6';
type Contact = 'swing' | 'tip' | 'roll';
type MainStat = 'kills' | 'errors' | 'attempts';

export default function ScoutingScreen() {
  const { lineup } = useLineup();
  const team = lineup.opponentName;
  const [mode, setMode] = useState<'scouting' | 'live'>('scouting');
  const [rotation, setRotation] = useState<number>(1);
  const [stats, setStats] = useState<Record<number, Record<string, any>>>({});
  const [selectedMain, setSelectedMain] = useState<MainStat | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const undoStack = useRef<any[]>([]);

  // build storage key
  const storageKey = `${mode === 'scouting' ? 'scout' : 'live'}_${team}`;

  // load whenever mode or team changes
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        setStats(raw ? JSON.parse(raw) : {});
      } catch (err) {
        console.error('load stats failed', err);
      }
    })();
  }, [storageKey]);

  // save whenever stats change
  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(stats)).catch(console.error);
  }, [stats, storageKey]);

  // front-row hitters helper
  const getFrontRowHitters = (rot: number) => {
    const arr = [
      [lineup.opponent.OH1, lineup.opponent.MB1, lineup.opponent.RS1],
      [lineup.opponent.OH2, lineup.opponent.MB1, lineup.opponent.RS1],
      [lineup.opponent.OH2, lineup.opponent.MB2, lineup.opponent.RS1],
      [lineup.opponent.OH2, lineup.opponent.MB2, lineup.opponent.RS2],
      [lineup.opponent.OH1, lineup.opponent.MB2, lineup.opponent.RS2],
      [lineup.opponent.OH1, lineup.opponent.MB1, lineup.opponent.RS2], // rot 6 uses MB1
    ];
    return arr[rot - 1] || [];
  };

  const defaultZones = () => ({
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
  });

  // record a stat
  const updateStat = (player: any, detail: StatDetail) => {
    if (!selectedMain || !selectedContact) return;
    setStats(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy[rotation]) copy[rotation] = {};
      const key = player.number ?? '?';
      if (!copy[rotation][key]) {
        copy[rotation][key] = {
          kills: {
            total: 0,
            contact: { swing: 0, tip: 0, roll: 0 },
            zones: defaultZones(),
            tool: 0,
          },
          errors: {
            total: 0,
            contact: { swing: 0, tip: 0, roll: 0 },
            blocked: 0,
            out: 0,
            net: 0,
          },
          attempts: {
            total: 0,
            contact: { swing: 0, tip: 0, roll: 0 },
            zones: defaultZones(),
            tool: 0,
          },
        };
      }
      const line = copy[rotation][key];

      // push undo
      undoStack.current.push({
        rotation,
        key,
        main: selectedMain,
        contact: selectedContact,
        detail,
      });

      // always count attempt for kills/errors
      if (selectedMain === 'kills' || selectedMain === 'errors') {
        line.attempts.total++;
        line.attempts.contact[selectedContact]++;
      }
      // increment main & contact
      line[selectedMain].total++;
      line[selectedMain].contact[selectedContact]++;

      // now detail
      if (selectedMain === 'errors') {
        line.errors[detail]++;
      } else {
        if (detail === 'tool') line[selectedMain].tool++;
        else line[selectedMain].zones[detail]++;
      }

      return copy;
    });
    setSelectedMain(null);
    setSelectedContact(null);
  };

  // undo last
  const undo = () => {
    const last = undoStack.current.pop();
    if (!last) return;
    setStats(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const { rotation: rot, key, main, contact, detail } = last;
      const line = copy[rot][key];

      // revert detail
      if (main === 'errors') {
        line.errors[detail]--;
      } else if (detail === 'tool') {
        line[main].tool--;
      } else {
        line[main].zones[detail]--;
      }

      // revert contact & total
      line[main].contact[contact]--;
      line[main].total--;

      // revert attempts for kills/errors
      if (main === 'kills' || main === 'errors') {
        line.attempts.contact[contact]--;
        line.attempts.total--;
      }
      return copy;
    });
  };

  const mainLabels: Record<MainStat, string> = {
    kills: 'Kill',
    errors: 'Error',
    attempts: 'Attempt',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* mode switch + new match */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={styles.modeBtn}
          onPress={() =>
            setMode(m => (m === 'scouting' ? 'live' : 'scouting'))
          }
        >
          <Text style={styles.btnText}>
            {mode === 'scouting' ? 'Switch to Live' : 'Switch to Scout'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeBtn}
          onPress={() => setStats({})}
        >
          <Text style={styles.btnText}>New Match</Text>
        </TouchableOpacity>
      </View>

      {/* rotation selector */}
      <Text style={styles.title}>Rotation {rotation}</Text>
      <View style={styles.buttonContainer}>
        {[1, 2, 3, 4, 5, 6].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.button, rotation === r && styles.selected]}
            onPress={() => setRotation(r)}
          >
            <Text style={styles.btnText}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* per-player sections */}
      {getFrontRowHitters(rotation).map((p, i) => {
        const key = p?.number ?? '?';
        const line = stats[rotation]?.[key] || {
          kills: { total: 0 },
          errors: { total: 0 },
          attempts: { total: 0 },
        };
        return (
          <View key={i} style={styles.playerSection}>
            <Text style={styles.playerTitle}>#{p?.number ?? '?'}</Text>
            <Text style={styles.summary}>
              K:{line.kills.total} E:{line.errors.total} A:{line.attempts.total}
            </Text>

            <View style={styles.mainButtons}>
              {(['kills', 'errors', 'attempts'] as MainStat[]).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.mainBtn,
                    selectedMain === m && styles.selectedBtn,
                  ]}
                  onPress={() => setSelectedMain(m)}
                >
                  <Text style={styles.btnText}>{mainLabels[m]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedMain && (
              <View style={styles.secondaryButtons}>
                {(['swing', 'tip', 'roll'] as Contact[]).map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.secBtn,
                      selectedContact === c && styles.selectedBtn,
                    ]}
                    onPress={() => setSelectedContact(c)}
                  >
                    <Text style={styles.btnText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedContact && (
              <View style={styles.detailButtons}>
                {(selectedMain === 'errors'
                  ? ['blocked', 'out', 'net']
                  : ['1', '2', '3', '4', '5', '6', 'tool']
                ).map(d => (
                  <TouchableOpacity
                    key={d}
                    style={styles.detailBtn}
                    onPress={() => updateStat(p, d as StatDetail)}
                  >
                    <Text style={styles.btnText}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.button, styles.undoBtn]}
        onPress={undo}
      >
        <Text style={styles.btnText}>Undo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeBtn: {
    padding: 8,
    backgroundColor: '#523178',
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  button: {
    padding: 10,
    margin: 4,
    backgroundColor: '#6200ea',
    borderRadius: 5,
  },
  selected: { backgroundColor: '#3700b3' },
  btnText: { color: 'white', fontWeight: 'bold' },
  playerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  playerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summary: { fontSize: 16, marginBottom: 8 },
  mainButtons: { flexDirection: 'row', marginBottom: 6 },
  mainBtn: {
    padding: 8,
    margin: 3,
    backgroundColor: '#6200ea',
    borderRadius: 4,
  },
  secondaryButtons: { flexDirection: 'row', marginBottom: 6 },
  secBtn: {
    padding: 6,
    margin: 3,
    backgroundColor: '#6200ea',
    borderRadius: 4,
  },
  detailButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailBtn: {
    padding: 6,
    margin: 3,
    backgroundColor: '#6200ea',
    borderRadius: 4,
  },
  selectedBtn: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  undoBtn: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: '#b00020',
  },
});
