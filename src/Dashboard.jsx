import { useState, useEffect } from 'react';
import { getIdeas, addIdea } from './firebase';

function Dashboard({ user }) {
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [savingIdea, setSavingIdea] = useState(false);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasData = await getIdeas();
        setIdeas(ideasData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingIdeas(false);
      }
    };
    fetchIdeas();
  }, []);

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !idea.trim()) return;
    
    setSavingIdea(true);
    try {
      await addIdea(titulo, idea, isPublic, user);
      const ideasData = await getIdeas();
      setIdeas(ideasData);
      setTitulo('');
      setIdea('');
      setIsPublic(true);
    } catch (err) {
      console.error('Error adding idea:', err);
    } finally {
      setSavingIdea(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="text-center w-full max-w-2xl px-4">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500 mb-8">
          Welcome back, {user.displayName || user.email}
        </p>
        
        {user.photoURL && (
          <div className="mb-8">
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mx-auto"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Mis Ideas</h2>
          
          <form onSubmit={handleAddIdea} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              required
            />
            <textarea
              placeholder="Idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              rows="3"
              required
            />
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              Hacer esta idea pública
            </label>
            <button
              type="submit"
              disabled={savingIdea}
              className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {savingIdea ? 'Guardando...' : 'Guardar Idea'}
            </button>
          </form>

          {loadingIdeas ? (
            <p className="text-gray-500">Cargando...</p>
          ) : ideas.length === 0 ? (
            <p className="text-gray-500">No hay ideas aún.</p>
          ) : (
            <div className="space-y-4">
              {ideas.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{item.titulo}</h3>
                  <p className="text-gray-600 mt-1">{item.idea}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
