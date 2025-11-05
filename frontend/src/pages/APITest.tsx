/**
 * API Test Page
 * Visual interface to test API endpoints
 */

import { useState } from 'react';
import { runAllTests, testHealth, testAPIInfo } from '../api/test';

const APITest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console.log
  const captureConsole = () => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: unknown[]) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };

    console.error = (...args: unknown[]) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    const restore = captureConsole();
    
    try {
      await runAllTests();
    } finally {
      restore();
      setIsRunning(false);
    }
  };

  const handleQuickTest = async () => {
    setIsRunning(true);
    setLogs([]);
    
    const restore = captureConsole();
    
    try {
      await testHealth();
      await testAPIInfo();
    } finally {
      restore();
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          🧪 API Test Suite
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleQuickTest}
            disabled={isRunning}
            className="rpg-button py-4"
          >
            {isRunning ? '⏳ Testing...' : '⚡ Quick Test (Health Check)'}
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="rpg-button py-4"
          >
            {isRunning ? '⏳ Running...' : '🚀 Run Full Test Suite'}
          </button>
        </div>

        <div className="rpg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              📋 Test Logs
            </h2>
            <button
              onClick={() => setLogs([])}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm"
            >
              Clear
            </button>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">
                No logs yet. Click a button above to run tests.
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.includes('✅')
                      ? 'text-green-400'
                      : log.includes('❌')
                      ? 'text-red-400'
                      : log.includes('ERROR')
                      ? 'text-red-500'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rpg-card p-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            📡 API Configuration
          </h2>
          <div className="space-y-2 text-[var(--color-text-secondary)]">
            <p>
              <strong>Base URL:</strong>{' '}
              <code className="text-[var(--color-primary)]">
                {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}
              </code>
            </p>
            <p>
              <strong>Timeout:</strong> 10 seconds
            </p>
            <p>
              <strong>Auth:</strong> JWT Bearer Token (auto-attached)
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={isRunning ? 'text-yellow-400' : 'text-green-400'}>
                {isRunning ? '🟡 Running' : '🟢 Ready'}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 rpg-card p-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
            🎯 Available Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Authentication</h3>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                <li>POST /auth/login</li>
                <li>POST /auth/register</li>
                <li>POST /auth/logout</li>
                <li>GET /auth/me</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Tasks</h3>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                <li>GET /tasks</li>
                <li>POST /tasks</li>
                <li>POST /tasks/:id/complete</li>
                <li>GET /tasks/stats</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Stories</h3>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                <li>POST /ai/story/arc/create</li>
                <li>POST /ai/story/arc/continue</li>
                <li>GET /stories</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold mb-2">Character</h3>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                <li>GET /character/profile</li>
                <li>GET /character/stats</li>
                <li>GET /inventory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITest;
