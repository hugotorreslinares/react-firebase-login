import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageSquare } from 'lucide-react';
import LikeDislike from './LikeDislike';
import { likeIdea, dislikeIdea } from '../firebase';
import homeTexts from '../locales/home.json';

const FeaturedIdea = ({ idea }) => {
  const [likes, setLikes] = useState(idea?.likes || 0);
  const [dislikes, setDislikes] = useState(idea?.dislikes || 0);

  if (!idea) return null;

  const t = homeTexts.featured;

  const handleLike = async () => {
    setLikes((l) => l + 1);
    try {
      await likeIdea(idea.id);
    } catch (err) {
      setLikes((l) => l - 1);
      console.error('Error liking featured idea:', err);
    }
  };

  const handleDislike = async () => {
    setDislikes((d) => d + 1);
    try {
      await dislikeIdea(idea.id);
    } catch (err) {
      setDislikes((d) => d - 1);
      console.error('Error disliking featured idea:', err);
    }
  };

  const handleShare = async () => {
    const shareText = `${t.badge}: ${idea.titulo}\n\n${idea.idea}`;
    const shareUrl = `${window.location.origin}/idea/${idea.id}`;

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
      alert(t.shareAlertCopied);
    } catch (error) {
      console.error('Clipboard share failed', error);
      alert(t.shareAlertFailed);
    }
  };

  return (
    <div className="bg-transparent text-gray-900 py-16 px-4 md:px-12 text-center relative border-t border-b border-black mb-16 rounded-none max-w-4xl mx-auto">
      {/* Editorial Badge */}
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-6">
        — {t.badge} —
      </div>

      <div className="space-y-6">
        {/* Category Label */}
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
          {idea.category || t.defaultCategory}
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-light tracking-[0.05em] text-black uppercase leading-tight font-serif">
          {idea.titulo}
        </h2>

        {/* Description / Body text */}
        <p className="text-gray-600 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed tracking-wide font-sans py-4">
          {idea.idea}
        </p>

        {/* Author / Metadata */}
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 pt-2 pb-6">
          {t.by} <span className="text-black font-bold">{idea.createdByName || idea.createdBy}</span>
        </div>

        {/* High-end minimalist interaction controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-gray-100">

          {/* Custom minimal LikeDislike container */}
          <div className="border border-black px-2 py-1">
            <LikeDislike
              onLike={handleLike}
              onDislike={handleDislike}
              likes={likes}
              dislikes={dislikes}
            />
          </div>

          {/* Action buttons with generous tracking and thin borders */}
          <div className="flex gap-4">
            <Link
              to={`/idea/${idea.id}`}
              className="inline-flex items-center gap-2 border border-black hover:bg-black hover:text-white text-black px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-none"
              title={t.comments}
            >
              <MessageSquare size={14} />
              <span>{t.comments}</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 border border-black hover:bg-black hover:text-white text-black px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-none"
              title={t.share}
            >
              <Share2 size={14} />
              <span>{t.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedIdea;