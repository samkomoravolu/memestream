import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WeeklyVote({ user }) {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  // Random poll topics
  const pollTopics = [
    "Should kids have social media?",
    "Is remote work better than office work?",
    "Should homework be banned?",
    "Is pineapple on pizza acceptable?",
    "Should video games be considered a sport?",
    "Is it okay to wear pajamas to work?",
    "Should pets be allowed in restaurants?",
    "Is it better to be early or fashionably late?",
    "Should emojis be used in professional emails?",
    "Is it okay to eat breakfast for dinner?",
    "Should there be a universal basic income?",
    "Is it better to read books or watch movies?",
    "Should there be a four-day work week?",
    "Is it okay to judge a book by its cover?",
    "Should there be a maximum age limit for driving?"
  ];

  useEffect(() => {
    fetchCurrentPoll();
  }, []);

  const fetchCurrentPoll = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/polls/current');
      setCurrentPoll(response.data);
      
      if (user) {
        // Check if user has already voted
        const voteResponse = await axios.get(`/api/polls/${response.data.id}/user-vote`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUserVote(voteResponse.data.vote);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      // If no poll exists, create a new one
      createNewPoll();
    } finally {
      setLoading(false);
    }
  };

  const createNewPoll = async () => {
    try {
      const randomTopic = pollTopics[Math.floor(Math.random() * pollTopics.length)];
      const response = await axios.post('/api/polls', {
        topic: randomTopic,
        week: getCurrentWeek()
      });
      setCurrentPoll(response.data);
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('Failed to load poll');
    }
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const handleVote = async (vote) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    if (userVote !== null) {
      alert('You have already voted on this poll');
      return;
    }

    try {
      setVoting(true);
      const token = localStorage.getItem('token');
      await axios.post(`/api/polls/${currentPoll.id}/vote`, 
        { vote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUserVote(vote);
      // Refresh poll data to get updated results
      fetchCurrentPoll();
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const calculatePercentages = () => {
    if (!currentPoll) return { yes: 0, no: 0 };
    
    const total = currentPoll.yes_votes + currentPoll.no_votes;
    if (total === 0) return { yes: 0, no: 0 };
    
    return {
      yes: Math.round((currentPoll.yes_votes / total) * 100),
      no: Math.round((currentPoll.no_votes / total) * 100)
    };
  };

  const renderPieChart = () => {
    const percentages = calculatePercentages();
    const yesAngle = (percentages.yes / 100) * 360;
    const noAngle = (percentages.no / 100) * 360;
    
    return (
      <div className="pie-chart-container">
        <div className="pie-chart">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="40"
              strokeDasharray={`${yesAngle * 2.51} 502.4`}
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#f44336"
              strokeWidth="40"
              strokeDasharray={`${noAngle * 2.51} 502.4`}
              strokeDashoffset={`-${yesAngle * 2.51}`}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="100" textAnchor="middle" dy=".3em" className="pie-center-text">
              {currentPoll.yes_votes + currentPoll.no_votes} votes
            </text>
          </svg>
        </div>
        <div className="pie-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Yes: {percentages.yes}% ({currentPoll.yes_votes} votes)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f44336' }}></div>
            <span>No: {percentages.no}% ({currentPoll.no_votes} votes)</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Weekly Poll...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button onClick={fetchCurrentPoll} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="card">
        <h2>No poll available</h2>
        <p>Check back next week for a new poll!</p>
      </div>
    );
  }

  return (
    <div className="weekly-vote">
      <div className="card">
        <div className="poll-header">
          <h1>📊 Weekly Poll</h1>
          <p className="poll-week">Week {currentPoll.week} of {new Date().getFullYear()}</p>
        </div>

        <div className="poll-question">
          <h2>{currentPoll.topic}</h2>
        </div>

        {userVote !== null ? (
          <div className="poll-results">
            <div className="vote-confirmation">
              <h3>✅ You voted: {userVote === 'yes' ? 'Yes' : 'No'}</h3>
              <p>Thank you for participating in this week's poll!</p>
            </div>
            
            <div className="results-section">
              <h3>Current Results:</h3>
              {renderPieChart()}
            </div>
          </div>
        ) : (
          <div className="poll-voting">
            <div className="vote-buttons">
              <button
                className={`vote-btn yes-btn ${voting ? 'disabled' : ''}`}
                onClick={() => handleVote('yes')}
                disabled={voting}
              >
                {voting ? 'Voting...' : '👍 Yes'}
              </button>
              <button
                className={`vote-btn no-btn ${voting ? 'disabled' : ''}`}
                onClick={() => handleVote('no')}
                disabled={voting}
              >
                {voting ? 'Voting...' : '👎 No'}
              </button>
            </div>
            
            {currentPoll.yes_votes > 0 || currentPoll.no_votes > 0 ? (
              <div className="preview-results">
                <h4>Current Results (Preview):</h4>
                {renderPieChart()}
              </div>
            ) : (
              <p className="no-votes">Be the first to vote on this week's poll!</p>
            )}
          </div>
        )}

        <div className="poll-info">
          <p><strong>Total Votes:</strong> {currentPoll.yes_votes + currentPoll.no_votes}</p>
          <p><strong>Poll Ends:</strong> End of Week {currentPoll.week}</p>
          {!user && (
            <p className="login-prompt">
              <Link to="/login">Login</Link> to vote on this week's poll!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyVote;
