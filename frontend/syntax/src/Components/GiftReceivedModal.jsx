import { useEffect, useState } from "react"
import { Gift, X, Sparkles, Star, ChevronRight, Heart } from "lucide-react"

// Move styles to a separate CSS module or use Tailwind classes
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
    25% { transform: translateY(-10px) rotate(90deg); opacity: 1; }
    50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
    75% { transform: translateY(-10px) rotate(270deg); opacity: 1; }
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes fall-glow {
    0% { 
      transform: translateY(-20px) rotate(0deg); 
      opacity: 0; 
    }
    10% { 
      opacity: 1; 
    }
    90% { 
      opacity: 0.8; 
    }
    100% { 
      transform: translateY(calc(100vh + 50px)) rotate(360deg); 
      opacity: 0; 
    }
  }
  
  @keyframes fall-glow-slow {
    0% { 
      transform: translateY(-30px) rotate(0deg) scale(0.8); 
      opacity: 0; 
    }
    15% { 
      opacity: 1; 
      transform: translateY(0px) rotate(45deg) scale(1); 
    }
    85% { 
      opacity: 0.9; 
    }
    100% { 
      transform: translateY(calc(100vh + 60px)) rotate(720deg) scale(0.6); 
      opacity: 0; 
    }
  }
  
  @keyframes fall-sparkle {
    0% { 
      transform: translateY(-20px) rotate(0deg) scale(1); 
      opacity: 0; 
    }
    20% { 
      opacity: 1; 
    }
    80% { 
      opacity: 0.7; 
    }
    100% { 
      transform: translateY(calc(100vh + 40px)) rotate(180deg) scale(0.5); 
      opacity: 0; 
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-twinkle {
    animation: twinkle 2s ease-in-out infinite;
  }
  
  .animate-fall-glow {
    animation: fall-glow linear forwards;
  }
  
  .animate-fall-glow-slow {
    animation: fall-glow-slow linear forwards;
  }
  
  .animate-fall-sparkle {
    animation: fall-sparkle linear forwards;
  }
  
  .animate-spin-fast {
    animation: spin 3s linear infinite;
  }
`

export default function GiftReceivedModal({ isOpen, onClose, day, xpAmount, onUseGift }) {
  const [animationStage, setAnimationStage] = useState(0)
  const [isClaimed, setIsClaimed] = useState(false)
  const [showFallingGlow, setShowFallingGlow] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setIsClaimed(false)
      setShowFallingGlow(false)
      return
    }

    setAnimationStage(0)
    const stage1 = setTimeout(() => setAnimationStage(1), 300)
    const stage2 = setTimeout(() => setAnimationStage(2), 1000)
    const stage3 = setTimeout(() => setAnimationStage(3), 1500)

    return () => {
      clearTimeout(stage1)
      clearTimeout(stage2)
      clearTimeout(stage3)
    }
  }, [isOpen])

  // Inject styles into document head
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const handleClaimGift = () => {
    setIsClaimed(true)
    setShowFallingGlow(true)

    // Hide falling effect after animation completes
    setTimeout(() => {
      setShowFallingGlow(false)
      onUseGift()
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-96 transform scale-100 transition-all duration-500">
        {/* Enhanced Particle Background */}
        <div className="absolute -inset-16 flex items-center justify-center overflow-hidden pointer-events-none">
          {animationStage > 0 &&
            [...Array(20)].map((_, i) => {
              const top = `${50 + Math.random() * 40 * (Math.random() > 0.5 ? 1 : -1)}%`
              const left = `${50 + Math.random() * 40 * (Math.random() > 0.5 ? 1 : -1)}%`
              const delay = `${Math.random() * 0.8}s`
              const duration = `${2 + Math.random() * 4}s`
              const size = Math.random() > 0.5 ? "w-1 h-1" : "w-2 h-2"
              const gradient =
                Math.random() > 0.5
                  ? "from-purple-400 to-pink-400"
                  : Math.random() > 0.5
                    ? "from-blue-400 to-purple-400"
                    : "from-pink-400 to-rose-400"

              return (
                <div
                  key={i}
                  className={`absolute ${size} rounded-full bg-gradient-to-r ${gradient} opacity-80 ${
                    animationStage > 1 ? "animate-float" : ""
                  }`}
                  style={{
                    top,
                    left,
                    animationDelay: delay,
                    animationDuration: duration,
                  }}
                ></div>
              )
            })}

          {/* Floating Stars */}
          {animationStage > 1 &&
            [...Array(8)].map((_, i) => {
              const top = `${30 + Math.random() * 40}%`
              const left = `${30 + Math.random() * 40}%`
              const delay = `${Math.random() * 1}s`
              return (
                <Star
                  key={`star-${i}`}
                  size={12}
                  className="absolute text-yellow-300 opacity-60 animate-twinkle"
                  style={{
                    top,
                    left,
                    animationDelay: delay,
                  }}
                />
              )
            })}
        </div>

        {/* Falling Glow Effect */}
        {showFallingGlow && (
          <div className="absolute -inset-32 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => {
              const left = `${Math.random() * 100}%`
              const delay = `${Math.random() * 2}s`
              const duration = `${2 + Math.random() * 2}s`
              const size = Math.random() > 0.7 ? "w-3 h-3" : Math.random() > 0.4 ? "w-2 h-2" : "w-1 h-1"
              const glowColor =
                Math.random() > 0.6
                  ? "shadow-purple-400/80"
                  : Math.random() > 0.3
                    ? "shadow-pink-400/80"
                    : "shadow-blue-400/80"
              const bgGradient =
                Math.random() > 0.6
                  ? "from-purple-400 to-purple-600"
                  : Math.random() > 0.3
                    ? "from-pink-400 to-pink-600"
                    : "from-blue-400 to-blue-600"

              return (
                <div
                  key={`fall-${i}`}
                  className={`absolute ${size} rounded-full bg-gradient-to-br ${bgGradient} opacity-90 animate-fall-glow shadow-lg ${glowColor}`}
                  style={{
                    left,
                    top: "-20px",
                    animationDelay: delay,
                    animationDuration: duration,
                    filter: "blur(0.5px)",
                  }}
                ></div>
              )
            })}

            {/* Larger Glowing Orbs */}
            {[...Array(12)].map((_, i) => {
              const left = `${Math.random() * 100}%`
              const delay = `${Math.random() * 1.5}s`
              const duration = `${3 + Math.random() * 2}s`
              const glowIntensity = Math.random() > 0.5 ? "shadow-2xl" : "shadow-xl"

              return (
                <div
                  key={`orb-${i}`}
                  className={`absolute w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 opacity-80 animate-fall-glow-slow ${glowIntensity} shadow-pink-400/60`}
                  style={{
                    left,
                    top: "-30px",
                    animationDelay: delay,
                    animationDuration: duration,
                    filter: "blur(1px)",
                  }}
                ></div>
              )
            })}

            {/* Sparkle Effects */}
            {[...Array(20)].map((_, i) => {
              const left = `${Math.random() * 100}%`
              const delay = `${Math.random() * 2.5}s`
              const duration = `${1.5 + Math.random() * 1.5}s`

              return (
                <Sparkles
                  key={`sparkle-${i}`}
                  size={8 + Math.random() * 8}
                  className="absolute text-yellow-300 opacity-70 animate-fall-sparkle"
                  style={{
                    left,
                    top: "-20px",
                    animationDelay: delay,
                    animationDuration: duration,
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Modal Card with Enhanced Styling */}
        <div
          className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-purple-400/40 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-1000 ${isClaimed ? "scale-105 shadow-purple-500/30" : ""}`}
        >
          {/* Enhanced Glow Effect when claimed */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl transition-all duration-1000 ${isClaimed ? "from-purple-500/20 via-pink-500/20 to-blue-500/20" : ""}`}
          ></div>

          {/* Success Glow Ring */}
          {isClaimed && (
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl opacity-30 animate-pulse"></div>
          )}

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 backdrop-blur-sm transition-all duration-500 ${animationStage > 1 ? "animate-pulse" : ""} ${isClaimed ? "from-green-600/30 to-emerald-600/30 border-green-400/40" : ""}`}
              >
                <Gift
                  size={22}
                  className={`transition-colors duration-500 ${isClaimed ? "text-green-300" : "text-purple-300"}`}
                />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${isClaimed ? "from-green-300 via-emerald-300 to-teal-300" : "from-purple-300 via-pink-300 to-blue-300"}`}
                >
                  {isClaimed ? "Reward Claimed!" : `Day ${day} XP Gift!`}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isClaimed ? "Successfully added to your account" : "Daily reward unlocked"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="relative py-10 flex flex-col items-center justify-center">
            {/* Main Gift Icon */}
            <div
              className={`relative mb-6 transform transition-all duration-700 ease-out ${animationStage > 0 ? "scale-100" : "scale-0"} ${isClaimed ? "scale-110" : ""}`}
            >
              <div
                className={`absolute inset-0 rounded-full blur-2xl opacity-50 transition-all duration-1000 ${animationStage > 1 ? "animate-pulse" : ""} ${isClaimed ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-70" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"}`}
              ></div>
              <div
                className={`relative p-6 rounded-full shadow-2xl border transition-all duration-1000 ${isClaimed ? "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 border-green-400/40" : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-purple-400/30"}`}
              >
                <div
                  className={`transform transition-all duration-500 ${animationStage > 1 ? "animate-bounce" : ""} ${isClaimed ? "animate-spin" : ""}`}
                  style={{ animationDuration: isClaimed ? "1s" : "2s" }}
                >
                  <Sparkles size={56} className="text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Enhanced Orbiting Hearts when claimed */}
              {(animationStage > 2 || isClaimed) && (
                <div
                  className={`absolute inset-0 transition-all duration-500 ${isClaimed ? "animate-spin-fast" : "animate-spin"}`}
                  style={{ animationDuration: isClaimed ? "3s" : "8s" }}
                >
                  <Heart
                    size={isClaimed ? 20 : 16}
                    className={`absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-70 transition-all duration-500 ${isClaimed ? "text-green-400" : "text-pink-400"}`}
                  />
                  <Heart
                    size={isClaimed ? 18 : 14}
                    className={`absolute top-1/2 -right-2 transform -translate-y-1/2 opacity-70 transition-all duration-500 ${isClaimed ? "text-emerald-400" : "text-purple-400"}`}
                  />
                  <Heart
                    size={isClaimed ? 20 : 16}
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-70 transition-all duration-500 ${isClaimed ? "text-teal-400" : "text-blue-400"}`}
                  />
                  <Heart
                    size={isClaimed ? 18 : 14}
                    className={`absolute top-1/2 -left-2 transform -translate-y-1/2 opacity-70 transition-all duration-500 ${isClaimed ? "text-green-400" : "text-pink-400"}`}
                  />
                </div>
              )}
            </div>

            {/* XP Amount Display */}
            <div
              className={`mb-4 transition-all duration-500 ${animationStage > 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div
                className={`border rounded-2xl px-6 py-3 backdrop-blur-sm transition-all duration-1000 ${isClaimed ? "bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-400/40" : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30"}`}
              >
                <h2
                  className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent text-center transition-all duration-500 ${isClaimed ? "from-green-300 via-emerald-300 to-teal-300" : "from-purple-300 via-pink-300 to-blue-300"}`}
                >
                  +{xpAmount} XP
                </h2>
              </div>
            </div>

            <p
              className={`text-center text-gray-300 mb-2 px-8 transition-all duration-500 delay-200 ${animationStage > 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {isClaimed ? "XP successfully added!" : `Amazing work on Day ${day}!`}
            </p>
            <p
              className={`text-center text-gray-400 text-sm px-8 transition-all duration-500 delay-300 ${animationStage > 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {isClaimed
                ? "Keep up the fantastic progress! 🌟"
                : "Claim your XP reward and keep building that streak! 🔥"}
            </p>
          </div>

          {/* Enhanced Footer */}
          {!isClaimed && (
            <div
              className={`relative p-6 bg-gradient-to-r from-gray-800/50 via-gray-700/30 to-gray-800/50 border-t border-gray-600/30 flex justify-between gap-3 transition-all duration-500 delay-400 ${animationStage > 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/70 to-orange-500/70 hover:from-amber-600 hover:to-orange-600 text-white border border-orange-400/50 hover:border-amber-300 transition-all duration-200 font-medium hover:scale-[1.02] shadow-lg backdrop-blur-sm"
                onClick={onClose}
              >
                Save for Later
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 font-semibold hover:scale-[1.02] border border-purple-400/30 group"
                onClick={handleClaimGift}
              >
                <span>Claim Reward</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Success Footer */}
          {isClaimed && (
            <div className="relative p-6 bg-gradient-to-r from-green-800/30 via-emerald-700/20 to-teal-800/30 border-t border-green-600/30 flex justify-center">
              <button
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold hover:scale-[1.02] shadow-xl shadow-green-500/25 transition-all duration-200 border border-green-400/30"
                onClick={onClose}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}