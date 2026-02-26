import { useState, useEffect, useRef } from 'react';
import { getLoginHistory } from './firebase';
import { Timestamp } from 'firebase/firestore';

function Dashboard({ user }) {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
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
    fetchHistory();
  }, [user.uid]);

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
      </div>
    </div>
  );
}

export default Dashboard;
