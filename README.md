# MemeStream 🎭

A Pinterest-like website where users can upload, vote, and comment on funny GIFs. Built with React frontend and Node.js backend.

## Features

- **User Authentication**: Sign up and login system with JWT tokens
- **Photo Gallery**: Browse all uploaded GIFs in a responsive grid layout
- **Photo Details**: View individual GIFs with comments and voting
- **Voting System**: Upvote and downvote GIFs (login required)
- **Comments**: Add comments to GIFs (login required)
- **Upload System**: Drag & drop GIF uploads (login required)
- **Responsive Design**: Modern, mobile-friendly UI with beautiful animations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **csv-parser** for CSV data handling

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with modern styling and animations

## Project Structure

```
memestream/
├── backend/                 # Node.js server
│   ├── package.json
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Navbar.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Home.js
│   │   │   ├── PhotoDetail.js
│   │   │   └── Upload.js
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # Entry point
│   │   ├── App.css
│   │   └── index.css       # Global styles
│   └── package.json
├── photos/                 # GIF storage directory
├── photos.csv              # Photo metadata
├── users.csv               # User accounts
├── comments.csv            # User comments
├── votes.csv               # User votes
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Usage
### Getting Started
1. Open your browser and go to `http://localhost:3000`
2. Create an account or login with existing credentials
3. Browse the home page to see all uploaded GIFs
4. Click on any GIF to view details, vote, and comment

### Existing Users
You can use these pre-existing accounts for testing:
- **Email**: samkomoravolu@gmail.com, **Password**: hiimbob72
- **Email**: vishu.gundi@gmail.com, **Password**: 9999cool

### Features
- **Home Page**: View all pictures and/or gifs  in a responsive grid
- **Photo Detail**: Click any photo and/or to see full size, vote, and comment
- **Upload**: Logged-in users can upload new GIFs
- **Voting**: Upvote/downvote GIFs (one vote per user per GIF)
- **Comments**: Add and view comments on GIFs

## API Endpoints
### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Photos
- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get single photo with comments/votes
- `POST /api/photos` - Upload new photo (authenticated)

### Interactions
- `POST /api/photos/:id/comments` - Add comment (authenticated)
- `POST /api/photos/:id/vote` - Vote on photo (authenticated)

## Data Storage

The application uses CSV files for data persistence:
- **users.csv**: User accounts with hashed passwords
- **photos.csv**: Photo metadata (ID, name)
- **comments.csv**: User comments on photos
- **votes.csv**: User votes on photos
-**poll.csv
--**poll_votes.csv


## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **File Validation**: Only GIF files are accepted for uploads
- **Input Validation**: Server-side validation for all inputs

## Customization

### Adding New Features
- Backend: Add new routes in `server.js`
- Frontend: Create new components in `src/components/`

### Styling
- Modify `src/index.css` for global styles
- Component-specific styles can be added to individual component files

### Data Structure
- Modify CSV files to add new fields
- Update corresponding API endpoints and frontend components

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the port in `backend/server.js` (PORT variable)
   - Update the proxy in `frontend/package.json`

2. **CORS Errors**
   - Ensure the backend is running on the correct port
   - Check that the proxy setting in frontend package.json matches backend port

3. **File Upload Issues**
   - Ensure the `photos/` directory exists and has write permissions
   - Check that only gifs or jpeg or webp jpg or png
 files are being uploaded

4. **Authentication Issues**
   - Clear browser localStorage and try logging in again
   - Check that JWT_SECRET is set in the backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository.
