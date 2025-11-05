/**
 * Login Page
 */

import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', { email, password });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="rpg-card p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
          🎮 Login to Playo
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <button type="submit" className="rpg-button w-full">
            Login
          </button>
        </form>
        
        <p className="text-center text-[var(--color-text-muted)] mt-6">
          Don't have an account? <a href="/register" className="text-[var(--color-primary)] hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
