import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, Share2, X, ChevronLeft, ChevronRight, Trash2, MessageSquare } from 'lucide-react';
import { getIdea, getComments, addComment, deleteComment, likeIdea, dislikeIdea } from './firebase';
import LikeDislike from './components/LikeDislike';
import Seo from './Seo';
import avatarPlaceholder from './assets/avatar-placeholder.svg';

const IdeaPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [idea, setIdea] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [challenge, setChallenge] = useState({ a: 0, b: 0, result: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [commentError, setCommentError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const generateChallenge = () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        setChallenge({ a, b, result: a + b });
        setUserAnswer('');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ideaData = await getIdea(id);
                if (!ideaData) {
                    navigate('/', { replace: true });
                    return;
                }
                setIdea(ideaData);
                const commentsData = await getComments(id);
                setComments(commentsData);
            } catch (err) {
                console.error('Error fetching idea data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        generateChallenge();
    }, [id, navigate]);

    const handleLike = async () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            await likeIdea(idea.id);
            const updatedIdea = await getIdea(id);
            setIdea(updatedIdea);
        } catch (err) {
            console.error('Error liking idea:', err);
        }
    };

    const handleDislike = async () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            await dislikeIdea(idea.id);
            const updatedIdea = await getIdea(id);
            setIdea(updatedIdea);
        } catch (err) {
            console.error('Error disliking idea:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setCommentError('');

        if (parseInt(userAnswer) !== challenge.result) {
            setCommentError('Respuesta incorrecta. Por favor, intenta de nuevo.');
            generateChallenge();
            return;
        }

        if (!commentText.trim()) {
            setCommentError('El comentario no puede estar vacío.');
            return;
        }

        setSubmitting(true);
        try {
            await addComment(id, user, commentText);
            setCommentText('');
            const updatedComments = await getComments(id);
            setComments(updatedComments);
            generateChallenge();
        } catch (err) {
            console.error('Error adding comment:', err);
            setCommentError('Error al publicar el comentario.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            try {
                await deleteComment(id, commentId);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (err) {
                console.error('Error deleting comment:', err);
            }
        }
    };

    const handleShare = async () => {
        const shareText = `${idea.titulo}\n\n${idea.idea}`;
        const shareUrl = window.location.href;

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
            alert('Texto copiado al portapapeles.');
        } catch (error) {
            console.error('Clipboard share failed', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Cargando idea...</p>
            </div>
        );
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": idea.titulo,
        "description": idea.idea.substring(0, 160),
        "author": {
            "@type": "Person",
            "name": idea.createdByName || idea.createdBy
        },
        "datePublished": new Date(idea.timestamp).toISOString(),
        "genre": idea.category || 'Random',
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": idea.likes || 0
            }
        ]
    };

    return (
        <>
            <Seo
                title={`ThinkUp - ${idea.titulo}`}
                description={idea.idea.substring(0, 160)}
                url={window.location.href}
                type="article"
                schema={schema}
            />
            <main className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition">
                        <ChevronLeft size={20} />
                        <span>Volver a las ideas</span>
                    </Link>

                    <article className="bg-white border border-gray-200 p-8 rounded-none shadow-sm mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h1 className="text-3xl font-bold text-gray-900 uppercase rounded-none">{idea.titulo}</h1>
                            <span className="bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 rounded-none">
                                {idea.category || 'Random'}
                            </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            {idea.public ? '🌐 Idea pública' : '🔒 Idea privada'} • Por: {idea.createdByName || idea.createdBy}
                        </p>

                        {idea.imageUrls?.length > 0 && (
                            <div className="mb-8 relative border border-gray-200 bg-gray-100 rounded-none overflow-hidden">
                                <img
                                    src={idea.imageUrls[imageIndex]}
                                    alt={`Imagen ${imageIndex + 1}`}
                                    className="w-full object-cover max-h-96"
                                    onContextMenu={(event) => event.preventDefault()}
                                />
                                {idea.imageUrls.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setImageIndex((idx) => (idx - 1 + idea.imageUrls.length) % idea.imageUrls.length)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white rounded-none"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageIndex((idx) => (idx + 1) % idea.imageUrls.length)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white rounded-none"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {idea.imageUrls.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setImageIndex(idx)}
                                                    className={`h-2 w-2 rounded-none ${idx === imageIndex ? 'bg-gray-900' : 'bg-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-line">
                            {idea.idea}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
                            <LikeDislike
                                onLike={handleLike}
                                onDislike={handleDislike}
                                likes={idea.likes || 0}
                                dislikes={idea.dislikes || 0}
                            />
                            <button
                                onClick={handleShare}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition rounded-none"
                            >
                                <Share2 size={18} />
                                Compartir
                            </button>
                        </div>
                    </article>

                    {/* Sección de Comentarios */}
                    <section className="bg-white border border-gray-200 p-8 rounded-none shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase flex items-center gap-2">
                            <MessageSquare size={20} />
                            Comentarios ({comments.length})
                        </h2>

                        <div className="space-y-8 mb-12">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 italic">No hay comentarios todavía. ¡Sé el primero en comentar!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={comment.createdByAvatar || avatarPlaceholder}
                                                    alt={comment.createdByName}
                                                    className="w-8 h-8 rounded-none object-cover border border-gray-100"
                                                />
                                                <div>
                                                    <span className="font-bold text-gray-900 block leading-tight">{comment.createdByName}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {user && user.email === comment.createdBy && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-gray-400 hover:text-red-500 transition"
                                                    title="Eliminar comentario"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Formulario de Comentario */}
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="space-y-4 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase">Deja un comentario</h3>
                                {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Escribe tu comentario aquí..."
                                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-400 min-h-[120px] rounded-none"
                                    required
                                />
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 border border-gray-200 w-full sm:w-auto">
                                        <span className="text-sm font-medium text-gray-700">
                                            ¿Cuánto es {challenge.a} + {challenge.b}?
                                        </span>
                                        <input
                                            type="number"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            className="w-16 px-2 py-1 border border-gray-300 focus:outline-none focus:border-gray-400 text-center rounded-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 rounded-none uppercase"
                                    >
                                        {submitting ? 'Enviando...' : 'Publicar comentario'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-none">
                                <p className="text-gray-600 mb-4">Inicia sesión para compartir tu opinión.</p>
                                <button
                                    onClick={() => navigate('/login', { state: { from: location.pathname } })}
                                    className="bg-gray-900 text-white px-8 py-3 text-sm font-bold hover:bg-gray-800 transition rounded-none uppercase"
                                >
                                    Iniciar sesión para comentar
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
};

export default IdeaPage;
