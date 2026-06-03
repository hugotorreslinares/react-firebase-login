import { useState, useEffect, useCallback } from 'react';
import { getUserIdeas, addIdea, updateIdea, deleteIdea, uploadIdeaImages } from './firebase';



function Dashboard({ user }) {
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [savingIdea, setSavingIdea] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [images, setImages] = useState([]);
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
    
    setSavingIdea(true);
    try {
      if (editingId) {
        await updateIdea(editingId, titulo, idea, isPublic);
        if (images.length > 0) {
          await uploadIdeaImages(images, editingId);
        }
        setEditingId(null);
      } else {
        const newIdeaId = await addIdea(titulo, idea, isPublic, user);
        if (images.length > 0) {
          await uploadIdeaImages(images, newIdeaId);
        }
      }
      setTitulo('');
      setIdea('');
      setIsPublic(true);
      setImages([]);
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
    setImages([]);
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
          <div className="mb-8 pb-8border-bottom" >
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20  mx-auto"
              onContextMenu={(event) => event.preventDefault()}
            />
          </div>
        )}

        <div className="bg-white p-8 shadow-sm grid gap-4 grid-cols-1 lg:grid-cols-2 bordered">
          
          <div className="">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
            {editingId ? 'Editar Idea' : 'Nueva Idea'}
          </h2>
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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


          {loadingIdeas ? (
            <p className="text-gray-500">Cargando...</p>
          ) : ideas.length === 0 ? (
            <p className="text-gray-500">No hay ideas aún.</p>
          ) : (
            <div className="space-y-4">
              {ideas.map((item) => (
                <div key={item.id} className="border border-gray-200  p-4 bordered">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 uppercase">{item.titulo}</h3>
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
                    <div className="flex gap-2 ml-4 border-bottom">
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
