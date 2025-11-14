/**
 * XP Gain Animation Component
 * Animated XP gain notification with optional level-up celebration
 */

import { useEffect, useState } from 'react'

interface XPGainAnimationProps {
  xpGained: number
  leveledUp?: boolean
  newLevel?: number
  onComplete?: () => void
}

const XPGainAnimation = ({ xpGained, leveledUp, newLevel, onComplete }: XPGainAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    // Show XP gain animation
    const xpTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    // Show level up after XP animation
    if (leveledUp) {
      const levelUpTimer = setTimeout(() => {
        setShowLevelUp(true)
      }, 1000)

      const hideTimer = setTimeout(() => {
        setShowLevelUp(false)
        onComplete?.()
      }, 4000)

      return () => {
        clearTimeout(xpTimer)
        clearTimeout(levelUpTimer)
        clearTimeout(hideTimer)
      }
    }

    return () => clearTimeout(xpTimer)
  }, [leveledUp, onComplete])

  if (!isVisible && !showLevelUp) return null

  return (
    <>
      {/* XP Gain Animation */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-float-up-fade">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-2xl shadow-amber-500/50 animate-pulse">
              +{xpGained} XP ⭐
            </div>
          </div>
        </div>
      )}

      {/* Level Up Celebration */}
      {showLevelUp && leveledUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative">
            {/* Confetti Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${50 + Math.random() * 10 - 5}%`,
                    top: `${50 + Math.random() * 10 - 5}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    background: [
                      '#ef4444',
                      '#f59e0b',
                      '#10b981',
                      '#3b82f6',
                      '#8b5cf6',
                      '#ec4899',
                    ][Math.floor(Math.random() * 6)],
                  }}
                />
              ))}
            </div>

            {/* Level Up Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl shadow-2xl shadow-purple-500/50 animate-scale-in text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-2">Level Up!</h2>
              <p className="text-purple-100 text-xl mb-4">
                You've reached level <span className="font-bold text-2xl">{newLevel}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-300">
                <span className="text-2xl">⭐</span>
                <span className="text-2xl">✨</span>
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations to global CSS */}
      <style>{`
        @keyframes float-up-fade {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(300px) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-float-up-fade {
          animation: float-up-fade 2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }

        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}

export default XPGainAnimation
