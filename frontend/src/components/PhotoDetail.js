import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PhotoDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');

  const fetchPhoto = useCallback(async () => {
    try {
      const response = await axios.get(`/api/photos/${id}`);
      setPhoto(response.data);
    } catch (error) {
      setError('Failed to load photo');
      console.error('Error fetching photo:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/photos/${id}/vote`, 
        { voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPhoto(); // Refresh to get updated vote counts
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!user) {
      alert('Please login to comment');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/photos/${id}/comments`,
        { comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      fetchPhoto(); // Refresh to get new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = photo?.name || 'Check out this meme!';
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccess('Link copied to clipboard!');
        setTimeout(() => setShareSuccess(''), 3000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShareSuccess('Link copied to clipboard!');
        setTimeout(() => setShareSuccess(''), 3000);
      }
    } else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
    } else if (platform === 'reddit') {
      const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
      window.open(redditUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="card">
        <div className="error">{error || 'Photo not found'}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="photo-detail">
      <div className="card">
                 <img 
           src={`http://localhost:5000/photos/${photo.extension ? photo.photo_id + photo.extension : (photo.name || '').trim() + '.gif'}`} 
           alt={photo.name || 'Untitled'}
           onError={(e) => {
             e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
           }}
         />
         <h1>{photo.name || 'Untitled'}</h1>
        
        <div className="photo-stats">
          <div className="stat">
            <span className="stat-icon">👍</span>
            <span>{photo.upvotes || 0} upvotes</span>
          </div>
          <div className="stat">
            <span className="stat-icon">👎</span>
            <span>{photo.downvotes || 0} downvotes</span>
          </div>
          <div className="stat">
            <span className="stat-icon">💬</span>
            <span>{photo.comments?.length || 0} comments</span>
          </div>
        </div>

        {user && (
          <div className="vote-buttons">
            <button 
              onClick={() => handleVote('up')} 
              className="vote-btn up"
            >
              👍 Upvote
            </button>
            <button 
              onClick={() => handleVote('down')} 
              className="vote-btn down"
            >
              👎 Downvote
            </button>
          </div>
        )}

        <div className="share-section">
          <h4>Share this meme:</h4>
          {shareSuccess && <div className="success">{shareSuccess}</div>}
          <div className="share-buttons">
            <button 
              onClick={() => handleShare('copy')} 
              className="share-btn copy"
              title="Copy link"
            >
              📋 Copy Link
            </button>
            <button 
              onClick={() => handleShare('twitter')} 
              className="share-btn twitter"
              title="Share on Twitter"
            >
              🐦 Twitter
            </button>
            <button 
              onClick={() => handleShare('facebook')} 
              className="share-btn facebook"
              title="Share on Facebook"
            >
              📘 Facebook
            </button>
            <button 
              onClick={() => handleShare('reddit')} 
              className="share-btn reddit"
              title="Share on Reddit"
            >
              🔴 Reddit
            </button>
          </div>
        </div>

        <div className="comments-section">
          <h3>Comments</h3>
          
          {user && (
            <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="comment">Add a comment</label>
                <input
                  type="text"
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you think about this meme?"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          {photo.comments && photo.comments.length > 0 ? (
                         photo.comments.map((comment, index) => (
               <div key={index} className="comment">
                 <div className="comment-author">{comment.username || comment.user_id}</div>
                 <div className="comment-text">{comment.comment}</div>
               </div>
             ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoDetail;
