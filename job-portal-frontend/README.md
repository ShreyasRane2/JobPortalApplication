# Job Portal Frontend - React Application

A comprehensive React frontend for the Job Portal microservices application with JWT authentication and integration with all 8 backend services.

## Features

- **User Authentication**: Login and Registration with JWT
- **Dashboard**: Central hub for all features
- **Profile Management**: Employee and Employer profiles
- **Job Listings**: Browse and search jobs
- **Job Applications**: Apply for jobs and track applications
- **Resume Management**: Upload and manage resumes
- **Notifications**: Real-time notifications
- **Admin Dashboard**: Job approval and management
- **Company Profiles**: Company information management

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Context API for state management
- CSS3 for styling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- All 8 backend microservices running

## Installation

1. Navigate to the frontend directory:
```cmd
cd job-portal-frontend
```

2. Install dependencies:
```cmd
npm install
```

## Configuration

The application connects to the following backend services:

- User Service: http://localhost:5454
- Profile Service: http://localhost:8088
- Resume Service: http://localhost:8090
- Job Service: http://localhost:8082
- Application Service: http://localhost:8087
- Notification Service: http://localhost:8086
- Admin Service: http://localhost:8085
- Company Service: http://localhost:8089

To change these URLs, edit `src/services/api.js`

## Running the Application

1. Start the development server:
```cmd
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The application will automatically reload when you make changes.

## Building for Production

```cmd
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
job-portal-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   └── PrivateRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Profile.js
│   │   ├── Jobs.js
│   │   ├── JobDetails.js
│   │   ├── Applications.js
│   │   ├── Resume.js
│   │   ├── Notifications.js
│   │   ├── AdminDashboard.js
│   │   └── CompanyProfile.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Features by Page

### 1. Login & Registration
- User authentication with JWT
- Role selection (Employee/Employer)
- Secure token storage

### 2. Dashboard
- Quick access to all features
- Visual navigation cards
- User-friendly interface

### 3. Profile Management
- Create Employee or Employer profiles
- View existing profiles
- Update profile information

### 4. Jobs
- Browse all available jobs
- Post new jobs (Employers)
- Filter and search functionality
- View job details

### 5. Applications
- Apply for jobs
- Track application status
- View application history

### 6. Resume
- Upload resume files
- View uploaded resumes
- Download resumes

### 7. Notifications
- View all notifications
- Mark notifications as read
- Real-time updates

### 8. Admin Dashboard
- View all jobs
- Approve/reject jobs
- Manage platform content

### 9. Company Profile
- Create company profiles
- Manage company information
- Update company details

## API Integration

All API calls are centralized in `src/services/api.js` with automatic JWT token handling.

Example API call:
```javascript
import { jobAPI } from '../services/api';

const jobs = await jobAPI.getAllJobs();
```

## Authentication Flow

1. User registers via `/register`
2. User logs in via `/login`
3. JWT token is stored in localStorage
4. Token is automatically included in all API requests
5. Protected routes require authentication
6. Logout clears token and redirects to login

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend services have CORS enabled:

```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Connection Refused
Make sure all backend services are running before starting the frontend.

### Token Expired
If you get authentication errors, try logging out and logging in again.

## Development Tips

1. Use React DevTools for debugging
2. Check browser console for errors
3. Use Network tab to inspect API calls
4. JWT token is stored in localStorage

## Future Enhancements

- Real-time notifications with WebSocket
- Advanced search and filters
- File preview for resumes
- Chat functionality
- Email notifications
- Social media integration
- Analytics dashboard

## Support

For issues or questions, please check:
1. Backend services are running
2. Correct ports are configured
3. JWT token is valid
4. CORS is enabled on backend

## License

This project is part of the Job Portal microservices application.
