import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const LikeDislike = ({ onLike, onDislike, likes = 0, dislikes = 0 }) => {
  return (
    <div className="flex gap-4 items-center border-bottom p-0">
      <button
        onClick={onLike}
        className="flex items-center gap-2 px-4 py-2 rounded hover:bg-green-100 transition"
        title="Like"
      >
        <ThumbsUp size={20} className="text-green-600 hover:text-green-800" />
        <span className="text-sm text-gray-700">{likes}</span>
      </button>
      <button
        onClick={onDislike}
        className="flex items-center gap-2 px-4 py-2 rounded hover:bg-red-100 transition"
        title="Dislike"
      >
        <ThumbsDown size={20} className="text-red-600 hover:text-red-800" />
        <span className="text-sm text-gray-700">{dislikes}</span>
      </button>
    </div>
  );
};

export default LikeDislike;