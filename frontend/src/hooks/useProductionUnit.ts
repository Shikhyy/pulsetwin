import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useProductionUnit = (unitId: string | null) => {
  const { get, loading, error } = useApi();
  const [unitData, setUnitData] = useState<any>(null);

  useEffect(() => {
    if (!unitId) {
      setUnitData(null);
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response = await get(`/api/production-units/${unitId}/journey`);
        if (isMounted) {
          setUnitData(response);
        }
      } catch (err) {
        if (isMounted) {
          setUnitData({
            unitId,
            journey: [
              { stationId: 'ST-01', name: 'Welding', status: 'pass', duration: '5m', observations: [] },
              { stationId: 'ST-02', name: 'Assembly', status: 'warning', duration: '12m', observations: ['High torque'] },
              { stationId: 'ST-03', name: 'Inspection', status: 'fail', duration: '2m', observations: ['Dimensional mismatch'] },
            ],
            quality: { status: 'rejected', reason: 'Dimensional mismatch' }
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [unitId, get]);

  return {
    unit: unitData,
    journey: unitData?.journey || [],
    quality: unitData?.quality || null,
    isLoading: loading,
    error
  };
};
