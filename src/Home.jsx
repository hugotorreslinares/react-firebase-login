import { useState, useEffect } from 'react';
import { getPublicIdeas } from './firebase';

function Home() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasData = await getPublicIdeas();
        setIdeas(ideasData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">
          Ideas Públicas
        </h1>
        
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : ideas.length === 0 ? (
          <p className="text-center text-gray-500">No hay ideas públicas aún.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-medium text-gray-900 text-lg">{item.titulo}</h3>
                <p className="text-gray-600 mt-2">{item.idea}</p>
                <p className="text-sm text-gray-400 mt-4">
                  Por: {item.createdByName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
