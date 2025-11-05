import { useState } from 'react'

function App() {
  const [xp, setXp] = useState(350)
  const [level, setLevel] = useState(5)
  const maxXp = 500

  const gainXp = () => {
    const newXp = xp + 50
    if (newXp >= maxXp) {
      setLevel(level + 1)
      setXp(0)
    } else {
      setXp(newXp)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-[var(--color-text-primary)] animate-float">
            ⚔️ Playo
          </h1>
          <p className="text-2xl text-[var(--color-text-secondary)]">
            Fantasy RPG Theme - Tailwind CSS v4
          </p>
        </div>

        {/* Character Card */}
        <div className="rpg-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                Hero of Habits
              </h2>
              <p className="text-[var(--color-text-secondary)]">Legendary Warrior</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[var(--color-level-up)] animate-pulse-glow">
                Level {level}
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Experience Points</span>
              <span>{xp} / {maxXp} XP</span>
            </div>
            <div className="xp-bar">
              <div 
                className="xp-bar-fill animate-xp-fill" 
                style={{ width: `${(xp / maxXp) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat-badge" style={{ borderColor: 'var(--color-strength)' }}>
              <span className="text-2xl">💪</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">STR</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-strength)' }}>25</div>
              </div>
            </div>
            <div className="stat-badge" style={{ borderColor: 'var(--color-wisdom)' }}>
              <span className="text-2xl">🧙</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">WIS</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-wisdom)' }}>18</div>
              </div>
            </div>
            <div className="stat-badge" style={{ borderColor: 'var(--color-agility)' }}>
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">AGI</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-agility)' }}>22</div>
              </div>
            </div>
            <div className="stat-badge" style={{ borderColor: 'var(--color-endurance)' }}>
              <span className="text-2xl">🛡️</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">END</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-endurance)' }}>20</div>
              </div>
            </div>
            <div className="stat-badge" style={{ borderColor: 'var(--color-luck)' }}>
              <span className="text-2xl">🍀</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">LCK</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-luck)' }}>15</div>
              </div>
            </div>
            <div className="stat-badge" style={{ borderColor: 'var(--color-charisma)' }}>
              <span className="text-2xl">✨</span>
              <div>
                <div className="text-xs text-[var(--color-text-muted)]">CHA</div>
                <div className="text-xl font-bold" style={{ color: 'var(--color-charisma)' }}>16</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={gainXp}
            className="rpg-button w-full py-4 text-lg"
          >
            Complete Task (+50 XP)
          </button>
        </div>

        {/* Item Rarity Examples */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            🎒 Item Rarity System
          </h3>
          <div className="flex flex-wrap gap-4">
            <span className="rarity-common font-bold">● Common</span>
            <span className="rarity-uncommon font-bold">● Uncommon</span>
            <span className="rarity-rare font-bold">● Rare</span>
            <span className="rarity-epic font-bold">● Epic</span>
            <span className="rarity-legendary font-bold animate-pulse-glow">● Legendary</span>
          </div>
        </div>

        {/* Theme Info */}
        <div className="text-center text-[var(--color-text-muted)] text-sm space-y-2">
          <p>✅ Tailwind CSS v4 with Custom RPG Theme</p>
          <p>✅ Custom Animations & Utility Classes</p>
          <p>✅ Fantasy Color Palette & Typography</p>
        </div>
      </div>
    </div>
  )
}

export default App
