import { useState, useEffect, useCallback } from 'react';
import { getUserIdeas, addIdea, updateIdea, deleteIdea, uploadIdeaImages } from './firebase';



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
      setSubmitError(err.message || 'Error al guardar la idea con imágenes');
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
    setCategory('Random');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className=" w-full max-w-6xl px-4 pb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">
          Mis Ideas
        </h1>
        <p className="text-gray-500 mb-8">
          Bienvenido, {user.displayName || user.email}
        </p>
        
        {user.photoURL && (
          <div className="mb-8 pb-8" >
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20  mx-auto"
              onContextMenu={(event) => event.preventDefault()}
            />
          </div>
        )}

        <div className="bg-white p-8 shadow-sm grid gap-4 grid-cols-1 lg:grid-cols-2">
          
          <div className="">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
            {editingId ? 'Editar Idea' : 'Nueva Idea'}
          </h2>
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {submitError}
              </div>
            )}
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200  focus:outline-none focus:border-gray-400"
              required
            />
            <textarea
              placeholder="Idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200  focus:outline-none focus:border-gray-400"
              rows="3"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              >
                <option value="Random">Random</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Selecciona la categoría del artículo o deja Random para asignarla por defecto.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes opcionales (máx. 3)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Puedes subir hasta tres imágenes para la idea, no es obligatorio.</p>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((file) => (
                    <div key={file.name} className=" border border-gray-200 p-2 text-xs text-gray-700 overflow-hidden">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                className="flex-1 py-3 bg-gray-900 text-white  hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {savingIdea ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar Idea'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-3 px-4 bg-gray-200 text-gray-700  hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
</div>
<div className="">


          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filtrar por categoría:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="Todas">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">Ordenado por categoría y fecha</div>
          </div>

          {loadingIdeas ? (
            <p className="text-gray-500">Cargando...</p>
          ) : sortedIdeas.length === 0 ? (
            <p className="text-gray-500">No hay ideas para esta categoría.</p>
          ) : (
            <div className="space-y-4">
              {sortedIdeas.map((item) => (
                <div key={item.id} className="border border-gray-200  p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-gray-900 uppercase">{item.titulo}</h3>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          {item.category || 'Random'}
                        </span>
                      </div>
                      {item.imageUrls?.length > 0 && (
                        <div className="mt-4 relative overflow-hidden  border border-gray-200 bg-gray-100">
                          <img
                            src={item.imageUrls[cardImageIndexes[item.id] || 0]}
                            alt={`Imagen ${(cardImageIndexes[item.id] || 0) + 1}`}
                            className="h-40 w-full object-cover"
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
                                className="absolute left-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                                aria-label="Imagen anterior"
                              >
                                &lt;
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = cardImageIndexes[item.id] || 0;
                                  const next = (current + 1) % item.imageUrls.length;
                                  changeCardImageIndex(item.id, next);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                                aria-label="Siguiente imagen"
                              >
                                &gt;
                              </button>
                            </>
                          )}
                          {item.imageUrls.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                              {item.imageUrls.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => changeCardImageIndex(item.id, idx)}
                                  className={`h-2.5 w-2.5  ${idx === (cardImageIndexes[item.id] || 0) ? 'bg-gray-900' : 'bg-gray-300'}`}
                                  aria-label={`Mostrar imagen ${idx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
    </div>
  );
}

export default Dashboard;
