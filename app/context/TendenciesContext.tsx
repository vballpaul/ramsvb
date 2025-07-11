import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TendenciesContextType = {
  loadScouting:   (team: string) => Promise<Record<number, Record<string, number>>>;
  saveScouting:   (team: string, data: any)    => Promise<void>;
  loadLive:       (team: string) => Promise<Record<number, Record<string, number>>>;
  saveLive:       (team: string, data: any)    => Promise<void>;
  resetLive:      (team: string) => Promise<void>;
};

const TendenciesContext = createContext<TendenciesContextType | undefined>(undefined);

const SCOUT_KEY = (team: string) => `tendencies:scout:${team}`;
const LIVE_KEY  = (team: string) => `tendencies:live:${team}`;

export const TendenciesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const loadScouting = async (team: string) => {
    const raw = await AsyncStorage.getItem(SCOUT_KEY(team));
    return raw ? JSON.parse(raw) : {};
  };
  const saveScouting = async (team: string, data: any) =>
    AsyncStorage.setItem(SCOUT_KEY(team), JSON.stringify(data));

  const loadLive = async (team: string) => {
    const raw = await AsyncStorage.getItem(LIVE_KEY(team));
    return raw ? JSON.parse(raw) : {};
  };
  const saveLive = async (team: string, data: any) =>
    AsyncStorage.setItem(LIVE_KEY(team), JSON.stringify(data));

  const resetLive = async (team: string) =>
    AsyncStorage.removeItem(LIVE_KEY(team));

  return (
    <TendenciesContext.Provider
      value={{ loadScouting, saveScouting, loadLive, saveLive, resetLive }}
    >
      {children}
    </TendenciesContext.Provider>
  );
};

export const useTendencies = () => {
  const ctx = useContext(TendenciesContext);
  if (!ctx) throw new Error('useTendencies must be used within a TendenciesProvider');
  return ctx;
};
