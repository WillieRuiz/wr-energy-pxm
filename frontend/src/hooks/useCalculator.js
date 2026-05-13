import { useContext } from 'react'
import { CalculatorContext } from '../context/CalculatorContext.jsx'

export function useCalculator() {
  const ctx = useContext(CalculatorContext)
  if (!ctx) throw new Error('useCalculator must be used inside CalculatorProvider')
  return ctx
}
