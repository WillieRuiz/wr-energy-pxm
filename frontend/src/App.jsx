import { CalculatorProvider } from './context/CalculatorContext.jsx'
import { useCalculator } from './hooks/useCalculator.js'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Screen0_Landing from './components/screens/Screen0_Landing.jsx'
import Screen1_Equipment from './components/screens/Screen1_LeadCapture.jsx'
import Screen2_Recommendation from './components/screens/Screen2_Equipment.jsx'
import Screen3_Contact from './components/screens/Screen3_Results.jsx'
import Screen4_Gracias from './components/screens/Screen4_Gracias.jsx'

function AppContent() {
  const { currentScreen, goToScreen } = useCalculator()

  if (currentScreen === 0) return <Screen0_Landing />

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        {currentScreen === 1 && <Screen1_Equipment />}
        {currentScreen === 2 && <Screen2_Recommendation />}
        {currentScreen === 3 && <Screen3_Contact />}
        {currentScreen === 4 && <Screen4_Gracias />}
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
