import { CalculatorProvider } from './context/CalculatorContext.jsx'
import { useCalculator } from './hooks/useCalculator.js'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Screen0_Landing from './components/screens/Screen0_Landing.jsx'
import Screen1_LeadCapture from './components/screens/Screen1_LeadCapture.jsx'
import Screen2_Equipment from './components/screens/Screen2_Equipment.jsx'
import Screen3_Results from './components/screens/Screen3_Results.jsx'

function AppContent() {
  const { currentScreen } = useCalculator()

  if (currentScreen === 0) return <Screen0_Landing />

  return (
    <div className="min-h-screen bg-hueso flex flex-col">
      <Header />
      <main className="flex-1">
        {currentScreen === 1 && <Screen1_LeadCapture />}
        {currentScreen === 2 && <Screen2_Equipment />}
        {currentScreen === 3 && <Screen3_Results />}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <CalculatorProvider>
      <AppContent />
    </CalculatorProvider>
  )
}
