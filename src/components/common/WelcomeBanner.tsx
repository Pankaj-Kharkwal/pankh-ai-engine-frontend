import React from 'react'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

interface WelcomeBannerProps {
  userName?: string
  workflowCount: number
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName, workflowCount }) => {
  const isFirstTime = workflowCount === 0
  const firstName = userName?.split(' ')[0] || 'there'

  // Common card style in your dark UI
  const cardClass =
    'rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-lg'

  const neon = 'text-[#C8FF00]' // neon lime highlight color

  if (isFirstTime) {
    return (
      <div className={`${cardClass} mb-8`}>
        <h2 className="text-3xl font-bold mb-2 text-white">
          Welcome to <span className={neon}>Pankh AI</span>, {firstName}! 🎉
        </h2>

        <p className="text-gray-300 leading-relaxed">
          You're all set to start building powerful <span className={neon}>AI workflows</span> and
          automations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Item 1 */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#C8FF00]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Create Workflows</h3>
              <p className="text-sm text-gray-400">
                Build your first <span className={neon}>automation workflow</span>.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#C8FF00]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Explore Blocks</h3>
              <p className="text-sm text-gray-400">
                Discover powerful <span className={neon}>AI building blocks</span>.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C8FF00]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Get Inspired</h3>
              <p className="text-sm text-gray-400">
                Check out templates and <span className={neon}>AI workflow examples</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Returning user UI
  return (
    <div className={`${cardClass} mb-6`}>
      <h2 className="text-2xl font-bold mb-1 text-white">
        Welcome back, <span className={neon}>{firstName}</span>! 👋
      </h2>
      <p className="text-gray-300">
        You have <span className={neon}>{workflowCount}</span> active workflow
        {workflowCount !== 1 ? 's' : ''}. Ready to build more?
      </p>
    </div>
  )
}
