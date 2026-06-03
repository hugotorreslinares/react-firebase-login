import { useState, useEffect } from 'react';
import { getPublicIdeas } from './firebase';
import Idea from './components/Idea';


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
        <h1 className="text-4xl font-light text-gray-900 mb-8 text-center mt-5">
          Ideas Públicas
        </h1>
        
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : ideas.length === 0 ? (
          <p className="text-center text-gray-500">No hay ideas públicas aún.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 text-left">
            {ideas.map((item) => (
              <Idea idea={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
