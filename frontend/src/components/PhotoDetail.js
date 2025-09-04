import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShareButton from './ShareButton';

function PhotoDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
          src={`/photos/${photo.name}.gif`} 
          alt={photo.name}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0 }}>{photo.name}</h1>
          <ShareButton photo={photo} url={window.location.href} />
        </div>
        
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
                <div className="comment-author">{comment.user_id}</div>
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
