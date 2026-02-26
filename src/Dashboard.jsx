import { useState, useEffect } from 'react';
import { getIdeas, addIdea, updateIdea, deleteIdea } from './firebase';

function Dashboard({ user }) {
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [savingIdea, setSavingIdea] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchIdeas = async () => {
    const ideasData = await getIdeas();
    setIdeas(ideasData.sort((a, b) => b.timestamp - a.timestamp));
    setLoadingIdeas(false);
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !idea.trim()) return;
    
    setSavingIdea(true);
    try {
      if (editingId) {
        await updateIdea(editingId, titulo, idea, isPublic);
        setEditingId(null);
      } else {
        await addIdea(titulo, idea, isPublic, user);
      }
      setTitulo('');
      setIdea('');
      setIsPublic(true);
      await fetchIdeas();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSavingIdea(false);
    }
  };

  const handleEdit = (item) => {
    setTitulo(item.titulo);
    setIdea(item.idea);
    setIsPublic(item.public || false);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta idea?')) return;
    try {
      await deleteIdea(id);
      await fetchIdeas();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleCancel = () => {
    setTitulo('');
    setIdea('');
    setIsPublic(true);
    setEditingId(null);
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
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {editingId ? 'Editar Idea' : 'Nueva Idea'}
          </h2>
          
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingIdea}
                className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {savingIdea ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar Idea'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {loadingIdeas ? (
            <p className="text-gray-500">Cargando...</p>
          ) : ideas.length === 0 ? (
            <p className="text-gray-500">No hay ideas aún.</p>
          ) : (
            <div className="space-y-4">
              {ideas.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.titulo}</h3>
                      <p className="text-gray-600 mt-1">{item.idea}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {item.public ? '🌐 Pública' : '🔒 Privada'} • {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
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
