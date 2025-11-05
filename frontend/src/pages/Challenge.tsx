/**
 * Challenge Page - Combat encounters
 */

import Layout from '../components/Layout'

const Challenge = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            🏆 Daily Challenge
          </h1>
          <p className="text-slate-400">
            Complete special challenges for bonus XP and rewards
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-slate-300 text-lg mb-2">No active challenges</p>
            <p className="text-slate-400 mb-6">
              Check back tomorrow for new challenges!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Challenge

