import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Poll({ user }) {
  const [poll, setPoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchPoll();
    if (user) {
      fetchUserVote();
    }
  }, [user]);

  const fetchPoll = async () => {
    try {
      console.log('Fetching poll data...');
      const response = await axios.get('/api/poll');
      console.log('Poll response:', response.data);
      setPoll(response.data);
    } catch (error) {
      console.error('Error fetching poll:', error);
      setError(`Failed to load poll: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/poll/user-vote', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserVote(response.data.userVote);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const handleVote = async (voteOption) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    setVoting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/poll/vote', 
        { voteOption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserVote(voteOption);
      fetchPoll(); // Refresh poll results
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (count) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((count / poll.totalVotes) * 100);
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Poll...</h2>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="card">
        <div className="error">{error || 'Failed to load poll'}</div>
      </div>
    );
  }

  return (
    <div className="poll-container">
      <div className="card">
        <div className="poll-header">
          <h1>🗳️ Weekly Poll</h1>
          <p className="poll-subtitle">Vote on this week's question!</p>
        </div>

        <div className="poll-question">
          <h2>{poll.question}</h2>
        </div>

        <div className="poll-options">
          {poll.options.map((option) => (
            <div key={option} className="poll-option">
              <button
                className={`poll-option-btn ${userVote === option ? 'selected' : ''}`}
                onClick={() => handleVote(option)}
                disabled={voting}
              >
                {option}
              </button>
              <div className="poll-result">
                <div className="poll-bar">
                  <div 
                    className="poll-fill"
                    style={{ 
                      width: `${getPercentage(poll.results[option])}%`,
                      backgroundColor: userVote === option ? '#667eea' : '#e1e5e9'
                    }}
                  ></div>
                </div>
                <div className="poll-stats">
                  <span className="poll-count">{poll.results[option]} votes</span>
                  <span className="poll-percentage">{getPercentage(poll.results[option])}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="poll-footer">
          <p>Total votes: {poll.totalVotes}</p>
          {userVote && (
            <p className="user-vote">Your vote: <strong>{userVote}</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Poll;
