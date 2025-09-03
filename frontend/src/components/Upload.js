import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Upload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    photo: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'image/gif') {
      setFormData({
        ...formData,
        photo: file
      });
      setError('');
    } else {
      setError('Please select a valid GIF file');
      setFormData({
        ...formData,
        photo: null
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a name for your meme');
      return;
    }
    
    if (!formData.photo) {
      setError('Please select a GIF file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('photo', formData.photo);

      await axios.post('/api/photos', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Meme uploaded successfully!');
      setFormData({ name: '', photo: null });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload meme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <div className="card">
        <h2>Upload Your Meme</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Meme Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Give your meme a funny name"
              required
            />
          </div>

          <div 
            className={`file-input ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/gif"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <label htmlFor="photo">
              <div className="file-input-text">
                {formData.photo ? (
                  `Selected: ${formData.photo.name}`
                ) : (
                  <>
                    📁 Drop your GIF here or click to browse<br />
                    <small>Only GIF files are supported</small>
                  </>
                )}
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading || !formData.photo || !formData.name.trim()}
          >
            {loading ? 'Uploading...' : 'Upload Meme'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
