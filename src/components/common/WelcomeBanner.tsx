import React from 'react'
import { Sparkles, Zap, TrendingUp } from 'lucide-react'

interface WelcomeBannerProps {
  userName?: string
  workflowCount: number
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ userName, workflowCount }) => {
  const isFirstTime = workflowCount === 0
  const firstName = userName?.split(' ')[0] || 'there'

  if (isFirstTime) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 border-2 border-purple-400/50 dark:border-purple-400/30 p-8 mb-8 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />

        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Welcome to Pankh AI, {firstName}! 🎉
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              You're all set to start building powerful AI-driven workflows! Let's create something
              amazing together.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Create Workflows
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Build your first automation workflow in minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-pink-200 dark:border-pink-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <TrendingUp
                    className="w-5 h-5 text-pink-600 dark:text-pink-400"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Explore Blocks
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discover powerful AI blocks and integrations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Get Inspired</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Browse templates and examples in marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-400/30 p-6 mb-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
        Welcome back, {firstName}! 👋
      </h2>
      <p className="text-gray-700 dark:text-gray-300">
        You have {workflowCount} active workflow{workflowCount !== 1 ? 's' : ''}. Ready to build
        more?
      </p>
    </div>
  )
}
