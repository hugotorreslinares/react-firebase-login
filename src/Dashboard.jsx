import { useState, useEffect, useCallback } from 'react';
import { getUserIdeas, addIdea, updateIdea, deleteIdea, uploadIdeaImages } from './firebase';
import { Edit3, Trash2, Globe, Lock, ChevronLeft, ChevronRight, Image, Plus, Check } from 'lucide-react';
import dashboardTexts from './locales/dashboard.json';

function Dashboard({ user }) {
  const categories = [
    'Ropa y accesorios',
    'Electrónica usada',
    'Hogar y decoración',
    'Muebles',
    'Deportes y fitness',
    'Juguetes y juegos',
    'Libros y entretenimiento',
    'Herramientas',
    'Coleccionables',
    'Accesorios de moda',
  ];

  const t = dashboardTexts;

  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState('Random');
  const [isPublic, setIsPublic] = useState(true);
  const [savingIdea, setSavingIdea] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [cardImageIndexes, setCardImageIndexes] = useState({});

  const fetchIdeas = useCallback(async () => {
    if (!user) {
      setIdeas([]);
      setLoadingIdeas(false);
      return;
    }
    try {
      const ideasData = await getUserIdeas(user);
      setIdeas(ideasData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !idea.trim()) return;
    setSubmitError('');
    setSavingIdea(true);
    const selectedCategory = category?.trim() || 'Random';
    try {
      if (editingId) {
        await updateIdea(editingId, titulo, idea, isPublic, selectedCategory);
        if (images.length > 0) {
          await uploadIdeaImages(images, editingId);
        }
        setEditingId(null);
      } else {
        const newIdeaId = await addIdea(titulo, idea, isPublic, user, selectedCategory);
        if (images.length > 0) {
          await uploadIdeaImages(images, newIdeaId);
        }
      }
      setTitulo('');
      setIdea('');
      setCategory('Random');
      setIsPublic(true);
      setImages([]);
      await fetchIdeas();
    } catch (err) {
      console.error('Error:', err);
      setSubmitError(err.message || t.form.errorHeader);
    } finally {
      setSavingIdea(false);
    }
  };

  const handleEdit = (item) => {
    setTitulo(item.titulo);
    setIdea(item.idea);
    setCategory(item.category || 'Random');
    setIsPublic(item.public || false);
    setEditingId(item.id);
    // Smooth scroll to the form element
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 3);
    setImages(selectedFiles);
  };

  const changeCardImageIndex = (ideaId, nextIndex) => {
    setCardImageIndexes((current) => ({
      ...current,
      [ideaId]: nextIndex,
    }));
  };

  const filteredIdeas = ideas.filter((item) => {
    const itemCategory = item.category || 'Random';
    return categoryFilter === 'Todas' || itemCategory === categoryFilter;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    const catA = (a.category || 'Random').localeCompare(b.category || 'Random');
    if (catA !== 0) return catA;
    return b.timestamp - a.timestamp;
  });

  const handleDelete = async (id) => {
    if (!confirm(t.feed.confirmDelete)) return;
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
    setCategory('Random');
    setIsPublic(true);
    setImages([]);
    setEditingId(null);
  };

  // Compute dashboard metrics
  const totalCount = ideas.length;
  const publicCount = ideas.filter((item) => item.public).length;
  const privateCount = ideas.filter((item) => !item.public).length;

  return (
    <div className="min-h-screen py-16 bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Creator Profile Header */}
        <header className="mb-12 text-center">
          <div className="bg-transparent pb-4 pt-4">
            {user.photoURL && (
              <div className="mb-6 inline-block border border-black p-1 rounded-none">
                <img
                  src={user.photoURL}
                  alt={t.header.profileAlt}
                  className="w-20 h-20 rounded-none object-cover transition-transform duration-500 hover:scale-105"
                  onContextMenu={(event) => event.preventDefault()}
                />
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-light text-black uppercase tracking-[0.1em] font-serif leading-tight">
              {t.header.title}
            </h1>
            <p className="mt-4 text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-light">
              {t.header.welcome} <span className="text-black font-semibold">{user.displayName || user.email}</span>
            </p>
          </div>
        </header>

        {/* Editorial Statistics Section */}
        <section className="grid grid-cols-3 border border-black rounded-none mb-16 text-center divide-x divide-black bg-transparent">
          <div className="py-6 px-2">
            <p className="text-2xl md:text-3xl font-light font-serif text-black">{totalCount}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">{t.stats.total}</p>
          </div>
          <div className="py-6 px-2">
            <p className="text-2xl md:text-3xl font-light font-serif text-black">{publicCount}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">{t.stats.public}</p>
          </div>
          <div className="py-6 px-2">
            <p className="text-2xl md:text-3xl font-light font-serif text-black">{privateCount}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">{t.stats.private}</p>
          </div>
        </section>

        {/* Form to Add/Edit Ideas - Chanel Inspired */}
        <section className="border border-black p-8 rounded-none mb-16 bg-transparent" aria-labelledby="form-title">
          <h2 id="form-title" className="text-xs font-bold uppercase tracking-[0.25em] text-black mb-8 border-b border-black pb-4">
            {editingId ? t.form.editTitle : t.form.newTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="text-xs uppercase tracking-wider text-red-600 border border-red-600 bg-red-50/50 p-4 rounded-none">
                {submitError}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label htmlFor="titulo" className="block text-xs font-bold uppercase tracking-[0.2em] text-black mb-2">
                {t.form.titlePlaceholder}
              </label>
              <input
                id="titulo"
                type="text"
                placeholder={t.form.titlePlaceholder}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 border border-black text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-0 rounded-none bg-white font-sans"
                required
              />
            </div>

            {/* Idea Textarea */}
            <div>
              <label htmlFor="idea" className="block text-xs font-bold uppercase tracking-[0.2em] text-black mb-2">
                {t.form.ideaPlaceholder}
              </label>
              <textarea
                id="idea"
                placeholder={t.form.ideaPlaceholder}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full px-4 py-3 border border-black text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-0 rounded-none bg-white font-sans"
                rows="4"
                required
              />
            </div>

            {/* Category Select */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-[0.2em] text-black mb-2">
                {t.form.categoryLabel}
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-black text-sm text-black bg-white focus:outline-none rounded-none uppercase tracking-widest font-semibold"
              >
                <option value="Random">{t.form.categoryDefault}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2">{t.form.categoryHelp}</p>
            </div>

            {/* Images Upload */}
            <div>
              <label htmlFor="images" className="block text-xs font-bold uppercase tracking-[0.2em] text-black mb-2">
                {t.form.imagesLabel}
              </label>
              <div className="border border-black p-4 bg-white relative rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition duration-300">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Image className="text-gray-400 mb-2" size={24} />
                <span className="text-xs uppercase tracking-wider text-black font-semibold">Seleccionar archivos</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-2">{t.form.imagesHelp}</p>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {images.map((file) => (
                    <div key={file.name} className="border border-black p-3 text-xs uppercase tracking-wider text-black bg-gray-50 rounded-none overflow-hidden truncate">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Is Public Toggle - Premium Button Group Style */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">
                {t.form.publicLabel}
              </span>
              <div className="inline-flex border border-black p-1 rounded-none gap-1 bg-white">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-none ${!isPublic ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'}`}
                >
                  <div className="flex items-center gap-2">
                    <Lock size={12} />
                    <span>{t.feed.privateBadge}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-none ${isPublic ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'}`}
                >
                  <div className="flex items-center gap-2">
                    <Globe size={12} />
                    <span>{t.feed.publicBadge}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={savingIdea}
                className="flex-1 py-4 bg-black text-white hover:bg-gray-900 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-none disabled:opacity-50"
              >
                {savingIdea ? t.form.btnSaving : editingId ? t.form.btnUpdate : t.form.btnSave}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-4 px-8 border border-black text-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-none"
                >
                  {t.form.btnCancel}
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Editorial Feed Section */}
        <main className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black pb-4 mb-12">
            <div className="flex items-center gap-3">
              <label htmlFor="categoryFilter" className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                {t.feed.filterLabel}
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-black text-xs uppercase tracking-widest bg-white focus:outline-none rounded-none"
              >
                <option value="Todas">{t.feed.filterAll}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{t.feed.sortingHelp}</div>
          </div>

          {loadingIdeas ? (
            <p className="text-center text-xs text-gray-500 uppercase tracking-[0.2em] py-12">{t.feed.loading}</p>
          ) : sortedIdeas.length === 0 ? (
            <p className="text-center text-xs text-gray-400 uppercase tracking-[0.2em] py-12">{t.feed.empty}</p>
          ) : (
            <section className="space-y-16" aria-label="Mis ideas publicadas">
              {sortedIdeas.map((item) => (
                <article key={item.id} className="bg-transparent text-gray-900 py-12 px-2 border-b border-black rounded-none">
                  <div className="space-y-5">

                    {/* Category Label */}
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      — {item.category || 'Random'} —
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-light tracking-[0.05em] text-black uppercase leading-tight font-serif">
                      {item.titulo}
                    </h3>

                    {/* Image Carousel */}
                    {item.imageUrls?.length > 0 && (
                      <div className="relative border border-black bg-gray-50 overflow-hidden max-w-2xl mx-auto my-6">
                        <img
                          src={item.imageUrls[cardImageIndexes[item.id] || 0]}
                          alt={`Imagen ${(cardImageIndexes[item.id] || 0) + 1}`}
                          className="h-64 w-full object-cover"
                          onContextMenu={(event) => event.preventDefault()}
                        />
                        {item.imageUrls.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const current = cardImageIndexes[item.id] || 0;
                                const next = (current - 1 + item.imageUrls.length) % item.imageUrls.length;
                                changeCardImageIndex(item.id, next);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 border border-black bg-white/95 p-2 text-black hover:bg-black hover:text-white transition duration-300 rounded-none"
                              aria-label="Imagen anterior"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = cardImageIndexes[item.id] || 0;
                                const next = (current + 1) % item.imageUrls.length;
                                changeCardImageIndex(item.id, next);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 border border-black bg-white/95 p-2 text-black hover:bg-black hover:text-white transition duration-300 rounded-none"
                              aria-label="Siguiente imagen"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}
                        {item.imageUrls.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {item.imageUrls.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => changeCardImageIndex(item.id, idx)}
                                className={`h-2 w-2 rounded-none ${idx === (cardImageIndexes[item.id] || 0) ? 'bg-black border border-black' : 'bg-gray-300 border border-transparent'}`}
                                aria-label={`Mostrar imagen ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Idea Description */}
                    <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed tracking-wide font-sans py-2">
                      {item.idea}
                    </p>

                    {/* Privacy & Date Metadata */}
                    <div className="flex items-center gap-4 text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 pb-4">
                      <span className="flex items-center gap-1">
                        {item.public ? <Globe size={12} /> : <Lock size={12} />}
                        <span>{item.public ? t.feed.publicBadge : t.feed.privateBadge}</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>

                    {/* Interactions / Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(item)}
                        className={`inline-flex items-center gap-2 border border-black px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-none ${editingId === item.id ? 'bg-black text-white' : 'bg-transparent hover:bg-black hover:text-white text-black'}`}
                      >
                        <Edit3 size={12} />
                        <span>{t.feed.btnEdit}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-2 border border-black text-black hover:border-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-none"
                      >
                        <Trash2 size={12} />
                        <span>{t.feed.btnDelete}</span>
                      </button>
                    </div>

                  </div>
                </article>
              ))}
            </section>
          )}
        </main>

      </div>
    </div>
  );
}

export default Dashboard;
