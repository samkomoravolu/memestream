import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ShareButton from './ShareButton';

function Home() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('/api/photos');
      console.log('Photos data:', response.data); // Debug log
      
      // Fetch vote data for each photo
      const photosWithVotes = await Promise.all(
        response.data.map(async (photo) => {
          try {
            const voteResponse = await axios.get(`/api/photos/${photo.photo_id}`);
            return {
              ...photo,
              upvotes: voteResponse.data.upvotes || 0,
              downvotes: voteResponse.data.downvotes || 0
            };
          } catch (error) {
            console.error(`Error fetching votes for photo ${photo.photo_id}:`, error);
            return {
              ...photo,
              upvotes: 0,
              downvotes: 0
            };
          }
        })
      );
      
      setPhotos(photosWithVotes);
    } catch (error) {
      setError('Sorry, we are facing some issues. Please try again later.');
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Memes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button onClick={fetchPhotos} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1>Welcome to MemeStream! 🎭</h1>
        <p>Discover and vote on the funniest GIFs from around the web.</p>
      </div>

      {photos.length === 0 ? (
        <div className="card">
          <h2>No memes yet!</h2>
          <p>Be the first to upload a funny GIF!</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.photo_id} className="photo-card">
              <Link to={`/photo/${photo.photo_id}`}>
                <img 
                  src={`http://localhost:5000/photos/${photo.extension ? photo.photo_id + photo.extension : (photo.name || '').trim() + '.gif'}`} 
                  alt={photo.name || 'Untitled'}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <div className="photo-card-votes">
                  <div className="vote-count up">
                    <span className="vote-icon">👍</span>
                    <span className="vote-number">{photo.upvotes}</span>
                  </div>
                  <div className="vote-count down">
                    <span className="vote-icon">👎</span>
                    <span className="vote-number">{photo.downvotes}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
