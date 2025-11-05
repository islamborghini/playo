/**
 * Story Page - AI-generated narrative
 */

import Layout from '../components/Layout'

const Story = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            📖 Your Story
          </h1>
          <p className="text-slate-400">
            Your personalized adventure unfolds here...
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-slate-300 text-lg mb-2">Your adventure awaits</p>
            <p className="text-slate-400">
              Complete tasks to unlock new chapters in your story
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Story

