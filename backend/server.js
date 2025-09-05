const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Email configuration (using Gmail for demo - in production use proper SMTP)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail
    pass: 'your-app-password' // Replace with your Gmail app password
  }
});

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/photos', express.static(path.join(__dirname, '../photos')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../photos'));
  },
  filename: function (req, file, cb) {
    const photoId = Date.now();
    cb(null, `${photoId}.gif`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/gif') {
      cb(null, true);
    } else {
      cb(new Error('Only GIF files are allowed'), false);
    }
  }
});

// Helper functions to read CSV files
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function writeCSV(filePath, data) {
  return new Promise((resolve, reject) => {
    const csvContent = data.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    
    fs.writeFile(filePath, csvContent, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes

// Forgot Password - Send verification code
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const users = await readCSV(path.join(__dirname, '../users.csv'));
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code
    verificationCodes.set(email, { code, expiresAt });

    // Send email (in demo mode, just log the code)
    console.log(`Verification code for ${email}: ${code}`);
    
    // In production, uncomment this to send actual emails:
    /*
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'MemeStream - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">MemeStream Password Reset</h2>
          <p>You requested to reset your password. Use the following code to verify your identity:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    */

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found for this email' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found for this email' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update password
    const users = await readCSV(path.join(__dirname, '../users.csv'));
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    
    await writeCSV(path.join(__dirname, '../users.csv'), users);
    
    // Remove verification code
    verificationCodes.delete(email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const users = await readCSV(path.join(__dirname, '../users.csv'));
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user ID
    const userId = email.split('@')[0] + Date.now().toString().slice(-4);
    
    // Add new user
    const newUser = {
      user_id: userId,
      email: email,
      password: hashedPassword
    };
    
    users.push(newUser);
    await writeCSV(path.join(__dirname, '../users.csv'), users);
    
    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { userId, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await readCSV(path.join(__dirname, '../users.csv'));
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { userId: user.user_id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all photos
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await readCSV(path.join(__dirname, '../photos.csv'));
    res.json(photos);
  } catch (error) {
    console.error('Error reading photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single photo with comments and votes
app.get('/api/photos/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    
    const photos = await readCSV(path.join(__dirname, '../photos.csv'));
    const photo = photos.find(p => p.photo_id === photoId);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const comments = await readCSV(path.join(__dirname, '../comments.csv'));
    const votes = await readCSV(path.join(__dirname, '../votes.csv'));
    
    const photoComments = comments.filter(c => c.photo_id === photoId);
    const photoVotes = votes.filter(v => v.photo_id === photoId);
    
    const upvotes = photoVotes.filter(v => v.vote_type === 'up').length;
    const downvotes = photoVotes.filter(v => v.vote_type === 'down').length;
    
    res.json({
      ...photo,
      comments: photoComments,
      upvotes,
      downvotes
    });
  } catch (error) {
    console.error('Error reading photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new photo
app.post('/api/photos', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Photo name is required' });
    }

    const photos = await readCSV(path.join(__dirname, '../photos.csv'));
    const photoId = Date.now().toString();
    
    const newPhoto = {
      photo_id: photoId,
      name: name
    };
    
    photos.push(newPhoto);
    await writeCSV(path.join(__dirname, '../photos.csv'), photos);
    
    res.json(newPhoto);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
app.post('/api/photos/:id/comments', authenticateToken, async (req, res) => {
  try {
    const photoId = req.params.id;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const comments = await readCSV(path.join(__dirname, '../comments.csv'));
    
    const newComment = {
      user_id: req.user.userId,
      photo_id: photoId,
      comment: comment
    };
    
    comments.push(newComment);
    await writeCSV(path.join(__dirname, '../comments.csv'), comments);
    
    res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on photo
app.post('/api/photos/:id/vote', authenticateToken, async (req, res) => {
  try {
    const photoId = req.params.id;
    const { voteType } = req.body;
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const votes = await readCSV(path.join(__dirname, '../votes.csv'));
    
    // Remove existing vote by this user on this photo
    const filteredVotes = votes.filter(v => 
      !(v.user_id === req.user.userId && v.photo_id === photoId)
    );
    
    // Add new vote
    const newVote = {
      user_id: req.user.userId,
      photo_id: photoId,
      vote_type: voteType
    };
    
    filteredVotes.push(newVote);
    await writeCSV(path.join(__dirname, '../votes.csv'), filteredVotes);
    
    res.json(newVote);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Poll routes

// Get current week's poll
app.get('/api/polls/current', async (req, res) => {
  try {
    const polls = await readCSV(path.join(__dirname, '../polls.csv'));
    const currentWeek = getCurrentWeek();
    const currentPoll = polls.find(p => p.week === currentWeek.toString());
    
    if (!currentPoll) {
      return res.status(404).json({ error: 'No poll found for current week' });
    }
    
    res.json(currentPoll);
  } catch (error) {
    console.error('Error fetching current poll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new poll
app.post('/api/polls', async (req, res) => {
  try {
    const { topic, week } = req.body;
    
    if (!topic || !week) {
      return res.status(400).json({ error: 'Topic and week are required' });
    }

    const polls = await readCSV(path.join(__dirname, '../polls.csv'));
    
    // Check if poll already exists for this week
    if (polls.find(p => p.week === week.toString())) {
      return res.status(400).json({ error: 'Poll already exists for this week' });
    }

    const pollId = Date.now().toString();
    const newPoll = {
      id: pollId,
      week: week,
      topic: topic,
      yes_votes: 0,
      no_votes: 0
    };
    
    polls.push(newPoll);
    await writeCSV(path.join(__dirname, '../polls.csv'), polls);
    
    res.json(newPoll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote on poll
app.post('/api/polls/:id/vote', authenticateToken, async (req, res) => {
  try {
    const pollId = req.params.id;
    const { vote } = req.body;
    
    if (!['yes', 'no'].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote. Must be "yes" or "no"' });
    }

    const polls = await readCSV(path.join(__dirname, '../polls.csv'));
    const poll = polls.find(p => p.id === pollId);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if user has already voted
    const pollVotes = await readCSV(path.join(__dirname, '../poll_votes.csv'));
    const existingVote = pollVotes.find(v => 
      v.poll_id === pollId && v.user_id === req.user.userId
    );
    
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    // Add vote
    const newVote = {
      poll_id: pollId,
      user_id: req.user.userId,
      vote: vote
    };
    
    pollVotes.push(newVote);
    await writeCSV(path.join(__dirname, '../poll_votes.csv'), pollVotes);

    // Update poll vote counts
    if (vote === 'yes') {
      poll.yes_votes = (parseInt(poll.yes_votes) + 1).toString();
    } else {
      poll.no_votes = (parseInt(poll.no_votes) + 1).toString();
    }
    
    await writeCSV(path.join(__dirname, '../polls.csv'), polls);
    
    res.json({ message: 'Vote recorded successfully', vote: vote });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's vote for a poll
app.get('/api/polls/:id/user-vote', authenticateToken, async (req, res) => {
  try {
    const pollId = req.params.id;
    const pollVotes = await readCSV(path.join(__dirname, '../poll_votes.csv'));
    
    const userVote = pollVotes.find(v => 
      v.poll_id === pollId && v.user_id === req.user.userId
    );
    
    res.json({ vote: userVote ? userVote.vote : null });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get current week
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
