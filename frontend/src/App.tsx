import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          🎮 Playo
        </h1>
        <p className="text-2xl text-purple-200 mb-12">
          Transform Your Habits into Epic Adventures
        </p>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Count: {count}
          </button>
          <p className="text-purple-100 mt-6">
            ✨ Tailwind CSS v4 is working!
          </p>
        </div>
        
        <p className="text-purple-300 mt-8 text-sm">
          Frontend setup complete - Ready to build! 🚀
        </p>
      </div>
    </div>
  )
}

export default App
