import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Share2, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import LikeDislike from './LikeDislike';
//import ImageGrader from './ImageGrader'
import avatarPlaceholder from '../assets/avatar-placeholder.svg';
import { likeIdea, dislikeIdea } from '../firebase';

const Idea = ({ idea, truncatePreview = false }) => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(idea.likes || 0);
    const [dislikes, setDislikes] = useState(idea.dislikes || 0);
    const [isOpen, setIsOpen] = useState(false);
    const [cardImageIndex, setCardImageIndex] = useState(0);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const handleLike = async () => {
        setLikes((l) => l + 1);
        try {
            await likeIdea(idea.id);
        } catch (err) {
            setLikes((l) => l - 1);
            console.error('Error liking idea:', err);
        }
    };

    const handleDislike = async () => {
        setDislikes((d) => d + 1);
        try {
            await dislikeIdea(idea.id);
        } catch (err) {
            setDislikes((d) => d - 1);
            console.error('Error disliking idea:', err);
        }
    };

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const handleShare = async () => {
        const shareText = `${idea.titulo}\n\n${idea.idea}`;
        const shareUrl = `${window.location.origin}/`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: idea.titulo,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Share canceled or failed', error);
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            alert('Texto copiado al portapapeles. Puedes pegarlo para compartirlo.');
        } catch (error) {
            console.error('Clipboard share failed', error);
            alert('No se pudo copiar el texto, intenta de nuevo.');
        }
    };

    return (
        <>
            <article className="bg-white  p-6 shadow-sm text-left relative bordered mb-8">
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <Link
                        to={`/idea/${idea.id}`}
                        className="inline-flex items-center justify-center bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 transition rounded-none"
                        title="Ver detalles y comentarios"
                    >
                        <MessageSquare size={18} />
                    </Link>
                    <button
                        onClick={openModal}
                        className="inline-flex items-center justify-center  bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 transition rounded-none"
                        title="Vista rápida"
                    >
                        <Eye size={18} />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-medium text-gray-900 text-lg uppercase">{idea.titulo}</h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {idea.category || 'Random'}
                  </span>
                </div>

                {idea.imageUrls?.length > 0 && (
                  <div className="mt-4 relative">
                    <div className="relative overflow-hidden  border border-gray-200 bg-gray-100">
                      <img
                        src={idea.imageUrls[cardImageIndex]}
                        alt={`Imagen ${cardImageIndex + 1}`}
                        className="h-48 w-full object-cover"
                        onContextMenu={(event) => event.preventDefault()}
                      />
                      {idea.imageUrls.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCardImageIndex((idx) => (idx - 1 + idea.imageUrls.length) % idea.imageUrls.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                            aria-label="Imagen anterior"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardImageIndex((idx) => (idx + 1) % idea.imageUrls.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                            aria-label="Siguiente imagen"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </div>
                    {idea.imageUrls.length > 1 && (
                      <div className="mt-2 flex justify-center gap-2">
                        {idea.imageUrls.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCardImageIndex(idx)}
                            className={`h-2.5 w-2.5  ${idx === cardImageIndex ? 'bg-gray-900' : 'bg-gray-300'}`} 
                            aria-label={`Mostrar imagen ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className={`text-gray-600 mt-2 ${truncatePreview ? 'truncate-2-lines' : ''}`}>{idea.idea}</p>
                <div className="text-sm text-gray-400 mt-4">
                    <div className="created-by">Por: {idea.createdByName}</div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <LikeDislike onLike={handleLike} onDislike={handleDislike} likes={likes} dislikes={dislikes} />
                </div>
            </article>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
                    <div className="w-full max-w-2xl  bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 uppercase">{idea.titulo}</h2>
                                <p className="text-sm text-gray-500 mt-2">{idea.public ? '🌐 Idea pública' : '🔒 Idea privada'}</p>
                                <p className="text-sm text-gray-500 mt-1">Categoría: {idea.category || 'Random'}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className=" p-2 text-gray-600 hover:bg-gray-100 transition"
                                aria-label="Cerrar detalles"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            {idea.imageUrls?.length > 0 && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-700">Imágenes</h3>
                                <div className="relative mt-3  border border-gray-200 bg-gray-100 overflow-hidden">
                                  <img
                                    src={idea.imageUrls[modalImageIndex]}
                                    alt={`Imagen ${modalImageIndex + 1}`}
                                    className="h-64 w-full object-cover"
                                    onContextMenu={(event) => event.preventDefault()}
                                  />
                                  {idea.imageUrls.length > 1 && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setModalImageIndex((idx) => (idx - 1 + idea.imageUrls.length) % idea.imageUrls.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                                        aria-label="Imagen anterior"
                                      >
                                        <ChevronLeft size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setModalImageIndex((idx) => (idx + 1) % idea.imageUrls.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2  bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                                        aria-label="Siguiente imagen"
                                      >
                                        <ChevronRight size={18} />
                                      </button>
                                    </>
                                  )}
                                </div>
                                {idea.imageUrls.length > 1 && (
                                  <div className="mt-2 flex justify-center gap-2">
                                    {idea.imageUrls.map((_, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setModalImageIndex(idx)}
                                        className={`h-2.5 w-2.5  ${idx === modalImageIndex ? 'bg-gray-900' : 'bg-gray-300'}`}
                                        aria-label={`Mostrar imagen ${idx + 1}`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Descripción</h3>
                                <p className="mt-2 text-gray-600 whitespace-pre-line">{idea.idea}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className=" bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Likes</p>
                                    <div className="mt-2 flex items-center gap-3">
                                      <p className="text-2xl font-semibold text-gray-900">{likes}</p>
                                      {idea.likedByAvatars?.length > 0 && (
                                        <div className="flex -space-x-2 overflow-hidden">
                                          {idea.likedByAvatars.slice(0, 4).map((url, idx) => (
                                            <img
                                              key={idx}
                                              src={url}
                                              alt={idea.likedByNames?.[idx] || 'Avatar'}
                                              title={idea.likedByNames?.[idx] || 'Votante'}
                                              onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = avatarPlaceholder;
                                              }}
                                              onContextMenu={(event) => event.preventDefault()}
                                              className="h-8 w-8  border-2 border-white shadow-sm"
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                </div>
                                <div className=" bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Dislikes</p>
                                    <div className="mt-2 flex items-center gap-3">
                                      <p className="text-2xl font-semibold text-gray-900">{dislikes}</p>
                                      {idea.dislikedByAvatars?.length > 0 && (
                                        <div className="flex -space-x-2 overflow-hidden">
                                          {idea.dislikedByAvatars.slice(0, 4).map((url, idx) => (
                                            <img
                                              key={idx}
                                              src={url}
                                              alt={idea.dislikedByNames?.[idx] || 'Avatar'}
                                              title={idea.dislikedByNames?.[idx] || 'Votante'}
                                              onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = avatarPlaceholder;
                                              }}
                                              onContextMenu={(event) => event.preventDefault()}
                                              className="h-8 w-8  border-2 border-white shadow-sm"
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                </div>
                            </div>
                            <div className=" bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">Creador</p>
                                <p className="mt-1 text-gray-700">{idea.createdByName || idea.createdBy}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                to={`/idea/${idea.id}`}
                                className="inline-flex items-center justify-center gap-2 bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition rounded-none uppercase"
                            >
                                <MessageSquare size={18} />
                                Comentarios
                            </Link>
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2  bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition rounded-none uppercase"
                            >
                                <Share2 size={18} />
                                Compartir
                            </button>
                            <button
                                onClick={closeModal}
                                className=" border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition rounded-none uppercase"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Idea;
