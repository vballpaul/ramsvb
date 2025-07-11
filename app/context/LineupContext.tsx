import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LineupContext = createContext();

export const LineupProvider = ({ children }) => {
  const [lineup, setLineup] = useState({
    rams: { OH1: '', OH2: '', MB1: '', MB2: '', RS1: '', RS2: '' },
    opponent: { OH1: '', OH2: '', MB1: '', MB2: '', RS1: '', RS2: '' },
    startingRotation: { rams: '1', opponent: '1' },
    servingFirst: 'Rams',
    opponentName: 'Opponent',
  });

  useEffect(() => {
    const loadStoredLineup = async () => {
      try {
        const storedLineup = await AsyncStorage.getItem('lineup');
        if (storedLineup) {
          setLineup(JSON.parse(storedLineup));
        }
      } catch (error) {
        console.error('Failed to load lineup:', error);
      }
    };

    loadStoredLineup();
  }, []);

  const saveLineup = async (updatedLineup) => {
    try {
      setLineup(updatedLineup);
      await AsyncStorage.setItem('lineup', JSON.stringify(updatedLineup));
    } catch (error) {
      console.error('Failed to save lineup:', error);
    }
  };

  return (
    <LineupContext.Provider value={{ lineup, setLineup: saveLineup }}>
      {children}
    </LineupContext.Provider>
  );
};

export const useLineup = () => {
  const context = useContext(LineupContext);
  if (!context) {
    throw new Error('useLineup must be used within a LineupProvider');
  }
  return context;
};
