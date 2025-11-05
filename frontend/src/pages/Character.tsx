/**
 * Character Page - Character sheet and inventory
 */

const Character = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-8">
          ⚔️ Character Sheet
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rpg-card p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">📊 Stats</h2>
            <p className="text-[var(--color-text-secondary)]">Character stats coming soon...</p>
          </div>
          
          <div className="rpg-card p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">🎒 Inventory</h2>
            <p className="text-[var(--color-text-secondary)]">Inventory system coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Character;
