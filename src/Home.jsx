import { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicIdeas } from './firebase';
import { Link } from 'react-router-dom';
import Idea from './components/Idea';
import Seo from './Seo';
import logo from './assets/logo.png';


function Home() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const observer = useRef();

  const lastIdeaElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < ideas.length) {
        setVisibleCount(prevCount => prevCount + 3);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, visibleCount, ideas.length]);

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

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ThinkUp",
    "url": "https://cool-ideas-beta.vercel.app/",
    "description": "Una plataforma colaborativa de votación de ideas.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cool-ideas-beta.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Seo
        title="ThinkUp - Plataforma colaborativa de ideas"
        description="ThinkUp es una plataforma para compartir, votar y descubrir ideas públicas con inicio de sesión seguro."
        url="https://cool-ideas-beta.vercel.app/"
        schema={schema}
      />
      <div className="min-h-screen  py-12 ">
        <div className="max6xl mx-auto px-0">
          <header className="bg-white shadow-gray-100 mb-5 py-1 border-bottom">
            <div className="text-center mt-8 mb-8">
              <img
                src={logo}
                alt="Logo ThinkUp"
                className="mx-auto h-24 w-24 rounded-full shadow-lg transition-transform duration-300 hover:-rotate-6"
              />
              <h1 className="mt-6 text-3xl font-bold text-gray-900 uppercase">Una plataforma colaborativa de votación de ideas.</h1>
                <p className="mt-3 text-gray-600">Descubre ideas públicas y comparte la tuya desde el dashboard.</p>
            </div>

            <div className="flex justify-center mb-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center  bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 rounded-none uppercase"
              >
                Añadir nueva idea
              </Link>
            </div>
          </header>
        </div>

        <main>
          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : ideas.length === 0 ? (
            <p className="text-center text-gray-500">No hay ideas públicas aún.</p>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-3 sm:grid-cols-1 text-left" aria-label="Listado de ideas">
                {ideas.slice(0, visibleCount).map((item, index) => {
                  const isNewBatch = index >= 6;
                  const itemInBatchIndex = isNewBatch ? (index - 6) % 3 : -1;

                  // Only apply animation to ideas beyond the initial 6
                  const animationStyle = isNewBatch ? {
                    animationDelay: `${itemInBatchIndex * 0.15}s`
                  } : {};
                  const animationClass = isNewBatch ? 'animate-slide-up opacity-0' : '';

                  if (index === Math.min(visibleCount, ideas.length) - 1) {
                    return (
                      <div ref={lastIdeaElementRef} key={item.id} className={animationClass} style={animationStyle}>
                        <Idea idea={item} truncatePreview />
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} className={animationClass} style={animationStyle}>
                      <Idea idea={item} truncatePreview />
                    </div>
                  );
                })}
              </section>
              {visibleCount >= ideas.length && ideas.length > 0 && (
                <div className="mt-12 mb-20 text-center">
                  <p className="text-gray-400 font-medium uppercase animate-bounce-custom">
                    ✨ ¡Has llegado al final de las ideas! ✨
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default Home;
