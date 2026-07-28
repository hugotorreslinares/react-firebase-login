import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, MessageSquare, Flame } from 'lucide-react';
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
    <div className="bg-gray-900 text-white p-8 md:p-12 shadow-md text-left relative border border-gray-800 mb-12 rounded-none transition-all duration-300">
      {/* Decorative Badge */}
      <div className="absolute top-4 right-4 bg-amber-500 text-gray-900 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-none">
        <Flame size={14} className="animate-pulse" />
        {t.badge}
      </div>

      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="bg-gray-800 text-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-none border border-gray-700">
            {idea.category || t.defaultCategory}
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase mb-4 leading-tight">
          {idea.titulo}
        </h2>

        <p className="text-gray-300 text-lg mb-6 line-clamp-3 md:line-clamp-none leading-relaxed">
          {idea.idea}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            {t.by} <span className="text-gray-200 font-medium">{idea.createdByName || idea.createdBy}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Custom styled LikeDislike for dark background */}
            <div className="flex gap-2 items-center bg-gray-800 p-1 border border-gray-700">
              <LikeDislike
                onLike={handleLike}
                onDislike={handleDislike}
                likes={likes}
                dislikes={dislikes}
              />
            </div>

            <div className="flex gap-2">
              <Link
                to={`/idea/${idea.id}`}
                className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider transition rounded-none"
                title={t.comments}
              >
                <MessageSquare size={16} />
                <span className="hidden sm:inline">{t.comments}</span>
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 px-4 py-2 text-sm font-bold uppercase tracking-wider transition rounded-none"
                title={t.share}
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">{t.share}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedIdea;