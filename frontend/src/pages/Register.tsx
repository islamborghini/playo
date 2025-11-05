/**
 * Register Page
 */

import { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    characterName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log('Register:', formData);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="rpg-card p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
          ⚔️ Create Your Hero
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Character Name</label>
            <input
              type="text"
              name="characterName"
              value={formData.characterName}
              onChange={handleChange}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-[var(--color-text-secondary)] mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
              required
            />
          </div>
          
          <button type="submit" className="rpg-button w-full">
            Begin Your Journey
          </button>
        </form>
        
        <p className="text-center text-[var(--color-text-muted)] mt-6">
          Already have an account? <a href="/login" className="text-[var(--color-primary)] hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
