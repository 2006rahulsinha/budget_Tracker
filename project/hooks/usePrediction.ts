// hooks/usePrediction.ts
import { useEffect, useState } from 'react'

export function usePrediction() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/predict')          // your Next.js route, not Python directly
      .then(r => r.json())
      .then(setPrediction)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { prediction, loading, error }
}