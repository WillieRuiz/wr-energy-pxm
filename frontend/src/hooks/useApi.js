import { useState, useCallback } from 'react'

export function useApi(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        return await fn(...args)
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fn]
  )

  return { call, loading, error }
}
