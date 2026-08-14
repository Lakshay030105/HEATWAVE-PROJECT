import { useState, useEffect } from 'react';

function getCentroid(coords) {
  if (!coords || !coords[0] || coords[0].length === 0) return [26.9124, 75.7873];
  const ring = coords[0];
  let latSum = 0;
  let lngSum = 0;
  ring.forEach(([lng, lat]) => {
    latSum += lat;
    lngSum += lng;
  });
  return [latSum / ring.length, lngSum / ring.length];
}

export function useMLPrediction(selectedWard) {
  const [predictionData, setPredictionData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  useEffect(() => {
    if (!selectedWard || !selectedWard.boundary) return;

    const fetchPrediction = async () => {
      setIsPredicting(true);
      setPredictionError(null);

      try {
        const [lat, lng] = getCentroid(selectedWard.boundary.coordinates);

        const payload = {
          latitude: lat,
          longitude: lng
        };

        const apiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/predict';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Backend Error: ${response.status}`);
        }

        const data = await response.json();
        setPredictionData(data);

      } catch (err) {
        console.error("ML Prediction Failed:", err);
        setPredictionError(err.message);
      } finally {
        setIsPredicting(false);
      }
    };

    fetchPrediction();
  }, [selectedWard]); 

  return { predictionData, isPredicting, predictionError };
}