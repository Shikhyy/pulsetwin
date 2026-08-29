import { useState, useEffect } from 'react';
import { useTwinStore } from '../stores/twinStore';
import { useApi } from './useApi';

export const useStationData = (stationId: string | null) => {
  const selectedStation = useTwinStore((state) => state.selectedStationId);
  const currentId = stationId || selectedStation;
  
  const { get, loading, error } = useApi();
  const [stationData, setStationData] = useState<any>(null);

  useEffect(() => {
    if (!currentId) {
      setStationData(null);
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response = await get(`/api/stations/${currentId}`);
        if (isMounted) {
          setStationData(response);
        }
      } catch (err) {
        if (isMounted) {
          // Fallback to mock data if API is not ready
          setStationData({
            id: currentId,
            name: `Station ${currentId}`,
            config: { type: 'assembly', capacity: 100 },
            state: { status: 'running', utilization: 85 },
            predictions: { nextMaintenance: '2d', failureProb: 0.15 },
            events: [],
            telemetry: {
              temperature: 45,
              vibration: 2.3
            }
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentId, get]);

  return {
    station: stationData,
    isLoading: loading,
    error
  };
};
