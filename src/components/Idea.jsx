import React, { useState } from 'react';
import LikeDislike from './LikeDislike';
import { likeIdea, dislikeIdea } from '../firebase';

const Idea = ({ idea }) => {
    const [likes, setLikes] = useState(idea.likes || 0);
    const [dislikes, setDislikes] = useState(idea.dislikes || 0);

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

    return (
        <div key={idea.id} className="bg-white rounded-2xl p-6 shadow-sm text-left">
            <h3 className="font-medium text-gray-900 text-lg">{idea.titulo}</h3>
            <p className="text-gray-600 mt-2">{idea.idea}</p>
            <div className="text-sm text-gray-400 mt-4 ">
                <div className="created-by">Por: {idea.createdByName}</div>

            </div>
                        <div className="mt-4 flex items-center gap-4">
                            <LikeDislike onLike={handleLike} onDislike={handleDislike} likes={likes} dislikes={dislikes} />
                        </div>
        </div>
    );
};

export default Idea;
