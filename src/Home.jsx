import { useState, useEffect, useRef, useCallback } from 'react';
import { getPublicIdeas } from './firebase';
import { Link } from 'react-router-dom';
import Idea from './components/Idea';
import FeaturedIdea from './components/FeaturedIdea';
import Seo from './Seo';
import logo from './assets/logo.png';
import homeTexts from './locales/home.json';

function Home() {
  const [ideas, setIdeas] = useState([]);
  const [featuredIdea, setFeaturedIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const observer = useRef();

  const t = homeTexts;

  // Filter out the featured idea from the main grid of ideas
  const filteredIdeas = featuredIdea
    ? ideas.filter(item => item.id !== featuredIdea.id)
    : ideas;

  const lastIdeaElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filteredIdeas.length) {
        setVisibleCount(prevCount => prevCount + 3);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, visibleCount, filteredIdeas.length]);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasData = await getPublicIdeas();
        setIdeas(ideasData);

        // Randomly pick a featured idea on page load
        if (ideasData && ideasData.length > 0) {
          const randomIndex = Math.floor(Math.random() * ideasData.length);
          setFeaturedIdea(ideasData[randomIndex]);
        }
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
    "description": t.seo.schemaDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cool-ideas-beta.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Seo
        title={t.seo.title}
        description={t.seo.description}
        url="https://cool-ideas-beta.vercel.app/"
        schema={schema}
      />
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Hero Section */}
          <header className="mb-12">
            <div className="bg-white border-b border-gray-100 pb-12 pt-8 text-center">
              <img
                src={logo}
                alt={t.hero.logoAlt}
                className="mx-auto h-24 w-24 rounded-none shadow-lg transition-transform duration-300 hover:-rotate-6"
              />
              <h1 className="mt-6 text-4xl font-black text-gray-900 uppercase tracking-tight">
                {t.hero.title}
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                {t.hero.subtitle}
              </p>

              {!loading && ideas.length === 0 && (
                <div className="mt-8">
                  <p className="text-gray-500 font-medium mb-4 uppercase">{t.hero.noIdeasMessage}</p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center bg-gray-900 px-8 py-4 text-base font-bold text-white transition hover:bg-gray-800 rounded-none uppercase tracking-wider"
                  >
                    {t.hero.addIdeaBtn}
                  </Link>
                </div>
              )}

            <div className="flex justify-center mb-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center  bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 rounded-none uppercase"
              >
                Añadir nueva idea
              </Link>
            </div>

            {/* Featured Idea Banner inside Hero */}
            {!loading && featuredIdea && (
              <div className="mt-12">
                <FeaturedIdea idea={featuredIdea} />
              </div>
            )}
          </header>

          <main>
            {loading ? (
              <p className="text-center text-gray-500 uppercase tracking-wider">{t.feed.loading}</p>
            ) : filteredIdeas.length === 0 && featuredIdea ? (
              <div className="text-center text-gray-400 mt-8 mb-12">
                <p className="uppercase font-semibold tracking-wider">{t.feed.endOfIdeas}</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              null // Fallback already handled inside header above
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6 border-b pb-2">
                  {t.feed.exploreHeader}
                </h3>
                <section className="grid gap-4 md:grid-cols-3 sm:grid-cols-1 text-left" aria-label="Listado de ideas">
                  {filteredIdeas.slice(0, visibleCount).map((item, index) => {
                    const isNewBatch = index >= 6;
                    const itemInBatchIndex = isNewBatch ? (index - 6) % 3 : -1;

                    // Only apply animation to ideas beyond the initial 6
                    const animationStyle = isNewBatch ? {
                      animationDelay: `${itemInBatchIndex * 0.15}s`
                    } : {};
                    const animationClass = isNewBatch ? 'animate-slide-up opacity-0' : '';

                    if (index === Math.min(visibleCount, filteredIdeas.length) - 1) {
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
                {visibleCount >= filteredIdeas.length && filteredIdeas.length > 0 && (
                  <div className="mt-12 mb-20 text-center">
                    <p className="text-gray-400 font-medium uppercase animate-bounce-custom">
                      {t.feed.reachedEnd}
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Home;