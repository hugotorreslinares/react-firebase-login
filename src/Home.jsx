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
      <div className="min-h-screen py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Chanel-Inspired Ultra-Minimalist Header & Hero */}
          <header className="mb-16">
            <div className="bg-transparent pb-12 pt-4 text-center">
              <img
                src={logo}
                alt={t.hero.logoAlt}
                className="mx-auto h-20 w-20 rounded-none transition-transform duration-500 hover:scale-105"
              />
              <h1 className="mt-8 text-3xl md:text-5xl font-light text-black uppercase tracking-[0.1em] font-serif max-w-4xl mx-auto leading-tight">
                {t.hero.title}
              </h1>
              <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-[0.2em] font-light max-w-xl mx-auto">
                {t.hero.subtitle}
              </p>

              {!loading && ideas.length === 0 && (
                <div className="mt-12">
                  <p className="text-xs text-gray-400 font-bold tracking-[0.2em] mb-6 uppercase">{t.hero.noIdeasMessage}</p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center border border-black text-black hover:bg-black hover:text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-none"
                  >
                    {t.hero.addIdeaBtn}
                  </Link>
                </div>
              )}

              {!loading && ideas.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center border border-black text-black hover:bg-black hover:text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-none"
                  >
                    {t.hero.addIdeaBtn}
                  </Link>
                </div>
              )}
            </div>

            {/* Featured Idea Banner inside Hero */}
            {!loading && featuredIdea && (
              <div className="mt-8">
                <FeaturedIdea idea={featuredIdea} />
              </div>
            )}
          </header>

          <main>
            {loading ? (
              <p className="text-center text-xs text-gray-500 uppercase tracking-[0.2em] py-12">{t.feed.loading}</p>
            ) : filteredIdeas.length === 0 && featuredIdea ? (
              <div className="text-center text-gray-400 mt-12 mb-16">
                <p className="text-xs uppercase tracking-[0.2em] font-light">{t.feed.endOfIdeas}</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              null // Fallback already handled inside header above
            ) : (
              <>
                <h3 className="text-xs font-bold text-black uppercase tracking-[0.25em] mb-8 border-b border-black pb-4">
                  {t.feed.exploreHeader}
                </h3>
                <section className="grid gap-8 md:grid-cols-3 sm:grid-cols-1 text-left" aria-label="Listado de ideas">
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
                  <div className="mt-16 mb-24 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] animate-bounce-custom">
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