import { useState, useEffect, useRef } from 'react';
import { getLoginHistory, getIdeas, addIdea } from './firebase';

function Dashboard({ user }) {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [savingIdea, setSavingIdea] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    
    const fetchHistory = async () => {
      try {
        setError(null);
        const history = await getLoginHistory(user.uid);
        setLoginHistory(history);
      } catch (err) {
        console.error('Error fetching login history:', err);
        setError(err.message);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    const fetchIdeas = async () => {
      try {
        const ideasData = await getIdeas();
        setIdeas(ideasData);
      } catch (err) {
        console.error('Error fetching ideas:', err);
      } finally {
        setLoadingIdeas(false);
      }
    };
    
    fetchHistory();
    fetchIdeas();
  }, [user.uid]);

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !idea.trim()) return;
    
    setSavingIdea(true);
    try {
      await addIdea(titulo, idea);
      const ideasData = await getIdeas();
      setIdeas(ideasData);
      setTitulo('');
      setIdea('');
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
        
        <div className="bg-white rounded-2xl p-8 shadow-sm inline-block mb-8">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
          )}
          <p className="text-gray-900 font-medium">{user.email}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Historial de inicios de sesión</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              Error: {error}
            </div>
          )}
          {loadingHistory ? (
            <p className="text-gray-500">Cargando...</p>
          ) : loginHistory.length === 0 ? (
            <p className="text-gray-500">No hay registros aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">#</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">Fecha y hora</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500">Correo</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.timestamp
                          ? (() => {
                              try {
                                const date = entry.timestamp instanceof Date 
                                  ? entry.timestamp 
                                  : entry.timestamp.toDate 
                                    ? entry.timestamp.toDate() 
                                    : new Date(entry.timestamp);
                                return isNaN(date.getTime()) ? '—' : date.toLocaleString();
                              } catch {
                                return '—';
                              }
                            })()
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{entry.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm mt-8">
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
