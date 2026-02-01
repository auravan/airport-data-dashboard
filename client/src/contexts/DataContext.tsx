import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface MockData {
  locations: Array<{ id: number; name: string; totalCount: number }>;
  birdSpecies: Array<{ name: string; count: number; color: string }>;
  recentMonitoring: Array<{ species: string; location: string; time: string }>;
  weeklyBirdData: Array<{ date: string; count: number }>;
  dailyActivityData: Array<{ time: string; count: number }>;
  predictionVsActualData: Array<{ time: string; predicted: number; actual: number }>;
  timeSegmentAnalysisData: Array<{ time: string; count: number }>;
}

interface DataContextType {
  data: MockData | null;
  loading: boolean;
  // Add methods
  addMonitoring: (entry: { species: string; location: string; time: string }) => void;
  updateLocation: (name: string, totalCount: number) => void;
  updateBirdSpecies: (name: string, count: number, color: string) => void;
  updateDailyActivity: (time: string, count: number) => void;
  updatePredictionActual: (time: string, predicted: number, actual: number) => void;
  updateSegmentAnalysis: (time: string, count: number) => void;
  updateWeeklyBirdData: (date: string, count: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = "airport-bird-dashboard-data";

function loadFromStorage(): MockData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load data from localStorage", e);
  }
  return null;
}

function saveToStorage(data: MockData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data to localStorage", e);
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MockData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data: first from localStorage, fallback to mock-data.json
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setData(stored);
      setLoading(false);
    } else {
      fetch("/mock-data.json")
        .then((res) => res.json())
        .then((mockData) => {
          setData(mockData);
          saveToStorage(mockData);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (data) saveToStorage(data);
  }, [data]);

  const addMonitoring = useCallback((entry: { species: string; location: string; time: string }) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recentMonitoring: [entry, ...prev.recentMonitoring].slice(0, 50), // keep max 50
      };
    });
  }, []);

  const updateLocation = useCallback((name: string, totalCount: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.locations.find((loc) => loc.name === name);
      if (existing) {
        return {
          ...prev,
          locations: prev.locations.map((loc) =>
            loc.name === name ? { ...loc, totalCount } : loc
          ),
        };
      } else {
        const newId = Math.max(...prev.locations.map((l) => l.id), 0) + 1;
        return {
          ...prev,
          locations: [...prev.locations, { id: newId, name, totalCount }],
        };
      }
    });
  }, []);

  const updateBirdSpecies = useCallback((name: string, count: number, color: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.birdSpecies.find((s) => s.name === name);
      if (existing) {
        return {
          ...prev,
          birdSpecies: prev.birdSpecies.map((s) =>
            s.name === name ? { ...s, count, color } : s
          ),
        };
      } else {
        return {
          ...prev,
          birdSpecies: [...prev.birdSpecies, { name, count, color }],
        };
      }
    });
  }, []);

  const updateDailyActivity = useCallback((time: string, count: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.dailyActivityData.find((d) => d.time === time);
      if (existing) {
        return {
          ...prev,
          dailyActivityData: prev.dailyActivityData.map((d) =>
            d.time === time ? { ...d, count } : d
          ),
        };
      } else {
        return {
          ...prev,
          dailyActivityData: [...prev.dailyActivityData, { time, count }].sort((a, b) =>
            a.time.localeCompare(b.time)
          ),
        };
      }
    });
  }, []);

  const updatePredictionActual = useCallback((time: string, predicted: number, actual: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.predictionVsActualData.find((d) => d.time === time);
      if (existing) {
        return {
          ...prev,
          predictionVsActualData: prev.predictionVsActualData.map((d) =>
            d.time === time ? { ...d, predicted, actual } : d
          ),
        };
      } else {
        return {
          ...prev,
          predictionVsActualData: [...prev.predictionVsActualData, { time, predicted, actual }].sort(
            (a, b) => a.time.localeCompare(b.time)
          ),
        };
      }
    });
  }, []);

  const updateSegmentAnalysis = useCallback((time: string, count: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.timeSegmentAnalysisData.find((d) => d.time === time);
      if (existing) {
        return {
          ...prev,
          timeSegmentAnalysisData: prev.timeSegmentAnalysisData.map((d) =>
            d.time === time ? { ...d, count } : d
          ),
        };
      } else {
        // For segments like 凌晨/上午 etc, order matters; insert based on known order
        const segmentOrder = ["凌晨", "上午", "中午", "下午", "傍晚", "夜晚"];
        const newList = [...prev.timeSegmentAnalysisData, { time, count }];
        newList.sort((a, b) => segmentOrder.indexOf(a.time) - segmentOrder.indexOf(b.time));
        return { ...prev, timeSegmentAnalysisData: newList };
      }
    });
  }, []);

  const updateWeeklyBirdData = useCallback((date: string, count: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const existing = prev.weeklyBirdData.find((d) => d.date === date);
      if (existing) {
        return {
          ...prev,
          weeklyBirdData: prev.weeklyBirdData.map((d) =>
            d.date === date ? { ...d, count } : d
          ),
        };
      } else {
        // Add and sort by date descending (newest first)
        const newList = [...prev.weeklyBirdData, { date, count }];
        newList.sort((a, b) => b.date.localeCompare(a.date));
        // Keep only last 7 entries
        return { ...prev, weeklyBirdData: newList.slice(0, 7) };
      }
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        addMonitoring,
        updateLocation,
        updateBirdSpecies,
        updateDailyActivity,
        updatePredictionActual,
        updateSegmentAnalysis,
        updateWeeklyBirdData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
}
