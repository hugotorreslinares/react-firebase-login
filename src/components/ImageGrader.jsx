import React, { useState, useRef, useEffect } from 'react';

// Cloudflare AI API endpoint (free tier)
const CLOUDFLARE_ACF_API = 'https://api.cloudflare.com/client/v4/accounts/f578c4bfdb2f9b7d1d25e71277d804f1/images';

// Replace the API key with an environment variable in .env.local
// Example: VITE_CLOUDFLARE_API_KEY=your_api_key_here

const CLOUDFLARE_API_KEY = import.meta.env.VITE_CLOUDFLARE_API_KEY;

const ImageGrader = () => {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Trigger analysis when user drops image
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('image')) {
      setImageFile(file);
      setTimeout(() => fileInputRef.current.value = null, 100);
    }
  };

  // Analyze image using Cloudflare AI
  const analyzeImage = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('model', 'image-grade'); // Uses Cloudflare's free grading model

      if (!CLOUDFLARE_API_KEY) {
        throw new Error('Cloudflare API key not configured. Set VITE_CLOUDFLARE_API_KEY in .env.local');
      }

      const res = await fetch(CLOUDFLARE_ACF_API, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Cloudflare-Api-Key': CLOUDFLARE_API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!res.ok) throw new Error('Image analysis failed');

      const data = await res.json();
      setResult(data.result); // Contains grading: "good", "bad", "needs_work"
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change (for browser compatibility)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  return (
    <div className="image-grader">
      <h2>🔍 Grade Your Image</h2>

      <div className="drop-zone" onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
        {imageFile ? (
          <div className="image-preview">
            <img src={URL.createObjectURL(imageFile)} alt="Preview" />
          </div>
        ) : (
          <p>Drag & drop an image here</p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0 }}
        />
      </div>

      {loading ? (
        <div className="loading">Analyzing with Cloudflare AI...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="result">
          <h3>Grade Result</h3>
          <p>
            {result ? `✅ ${result.grading_score} / 100 (${result.label})` : 'Analyzed!'}
          </p>
        </div>
      )}

      <button
        onClick={() => analyzeImage()}
        disabled={!imageFile || loading}
        className="btn"
      >
        {loading ? 'Analyzing...' : 'Grade Image'}
      </button>
    </div>
  );
};

export default ImageGrader;