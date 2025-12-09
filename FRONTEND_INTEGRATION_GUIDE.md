# Frontend Integration Guide - FacialDerma AI Backend

## Quick Start

**Base URL**: `http://localhost:5000` (development)  
**API Docs**: `http://localhost:5000/docs` (Swagger UI for testing)

## Authentication Flow

### 1. User Registration

**Endpoint**: `POST /api/auth/signup`

```javascript
// Request
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "john_doe",
    email: "john@example.com",
    password: "SecurePass123",
    role: "patient" // or "dermatologist"
  })
});

// Success Response (201)
{
  "message": "User registered successfully"
}

// Error Response (400)
{
  "error": "Email already exists"
}
// or
{
  "error": "Username already exists"
}
```

**Validation Rules**:
- Username: no spaces allowed
- Email: valid email format
- Password: required (bcrypt hashed on server)
- Role: must be exactly `"patient"` or `"dermatologist"`

### 2. User Login

**Endpoint**: `POST /api/auth/login`

```javascript
// Request
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailOrUsername: "john@example.com", // or username
    password: "SecurePass123",
    role: "patient"
  })
});

// Success Response (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673a1b2c3d4e5f6789012345",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient"
  }
}

// Error Response (401)
{
  "error": "Invalid credentials"
}
```

**What to Store**:
```javascript
// Save these in localStorage/sessionStorage
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.user.id);
localStorage.setItem('userRole', response.user.role);
localStorage.setItem('username', response.user.username);
```

### 3. Get Current User Profile

**Endpoint**: `GET /api/users/me`

```javascript
// Request (include token in header)
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Success Response (200)
{
  "id": "673a1b2c3d4e5f6789012345",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "patient"
}

// Error Response (401)
{
  "error": "Token is not valid"
}
```

**Use Case**: Check if user is still logged in, refresh profile data

---

## Patient Workflows

### 4. Upload Image for Skin Analysis

**Endpoint**: `POST /api/predictions/predict`

```javascript
// Request (FormData for file upload)
const token = localStorage.getItem('token');
const formData = new FormData();
formData.append('file', imageFile); // imageFile is a File object from <input type="file">

const response = await fetch('http://localhost:5000/api/predictions/predict', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Do NOT set Content-Type - browser sets it automatically with boundary
  },
  body: formData
});

// Success Response (201)
{
  "id": "673a2b3c4d5e6f7890123456",
  "userId": "673a1b2c3d4e5f6789012345",
  "result": {
    "predicted_label": "Acne",
    "confidence_score": 0.876
  },
  "imageUrl": "http://localhost:5000/uploads/1234567890_image.jpg",
  "createdAt": "2025-11-17T10:30:00Z"
}

// Error Responses
// 400 - No file
{
  "error": "No file uploaded"
}

// 400 - Invalid file type
{
  "error": "Invalid file type. Only jpg, jpeg, png allowed"
}

// 400 - Image too blurry
{
  "error": "Image is blury. Please upload a clear image"
}

// 400 - No face detected
{
  "error": "No face detected in the image"
}
```

**Display on Screen**:
- Show `result.predicted_label` as the diagnosis
- Show `result.confidence_score * 100` as percentage (e.g., "87.6% confidence")
- Display `imageUrl` in an `<img>` tag
- Store `id` for requesting dermatologist review later

**Possible Labels**:
- `"Acne"`
- `"Melanoma"`
- `"Normal"`
- `"Perioral_Dermatitis"`
- `"Rosacea"`
- `"Warts"`

### 5. View Prediction History

**Endpoint**: `GET /api/predictions`

```javascript
// Request
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/predictions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Success Response (200) - Array of predictions
[
  {
    "id": "673a2b3c4d5e6f7890123456",
    "userId": "673a1b2c3d4e5f6789012345",
    "result": {
      "predicted_label": "Acne",
      "confidence_score": 0.876
    },
    "imageUrl": "http://localhost:5000/uploads/1234567890_image.jpg",
    "createdAt": "2025-11-17T10:30:00Z"
  },
  {
    "id": "673a2b3c4d5e6f7890123457",
    "userId": "673a1b2c3d4e5f6789012345",
    "result": {
      "predicted_label": "Rosacea",
      "confidence_score": 0.654
    },
    "imageUrl": "http://localhost:5000/uploads/1234567891_image.jpg",
    "createdAt": "2025-11-16T14:20:00Z"
  }
]

// Empty array if no predictions
[]
```

**Display**: List/grid showing thumbnails, diagnosis, confidence, and date (sorted newest first)

### 6. List Available Dermatologists

**Endpoint**: `GET /api/users/dermatologists`

```javascript
// Request (with optional search and pagination)
const token = localStorage.getItem('token');
const searchQuery = "smith"; // optional
const response = await fetch(
  `http://localhost:5000/api/users/dermatologists?q=${searchQuery}&limit=20&offset=0`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Success Response (200)
{
  "dermatologists": [
    {
      "id": "673a3c4d5e6f7890123458",
      "username": "dr_smith",
      "email": "dr.smith@example.com",
      "createdAt": "2025-11-15T08:00:00Z"
    },
    {
      "id": "673a3c4d5e6f7890123459",
      "username": "dr_johnson",
      "email": "dr.johnson@example.com",
      "createdAt": "2025-11-14T09:30:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

**Display**: 
- Show as cards/list with username and email
- Add "Request Review" button for each dermatologist
- Implement pagination using `offset` (offset = page * limit)

### 7. Request Dermatologist Review

**Endpoint**: `POST /api/review-requests`

```javascript
// Request
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/review-requests', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    predictionId: "673a2b3c4d5e6f7890123456", // from prediction.id
    dermatologistId: "673a3c4d5e6f7890123458" // from selected dermatologist
  })
});

// Success Response (201)
{
  "id": "673a4d5e6f7890123460",
  "predictionId": "673a2b3c4d5e6f7890123456",
  "patientId": "673a1b2c3d4e5f6789012345",
  "dermatologistId": "673a3c4d5e6f7890123458",
  "status": "pending",
  "comment": null,
  "createdAt": "2025-11-17T11:00:00Z",
  "reviewedAt": null,
  "patientUsername": "john_doe",
  "dermatologistUsername": "dr_smith"
}

// Error Responses
// 409 - Duplicate request
{
  "error": "A review request to this dermatologist already exists for this prediction"
}

// 403 - Not your prediction
{
  "error": "You can only request reviews for your own predictions"
}

// 404 - Dermatologist not found
{
  "error": "Dermatologist not found"
}
```

**UI Flow**:
1. Show success message: "Review request sent to Dr. [username]"
2. Navigate to "My Requests" screen
3. Dermatologist receives email + in-app notification

### 8. View Patient's Review Requests

**Endpoint**: `GET /api/review-requests`

```javascript
// Request (filter by status optional)
const token = localStorage.getItem('token');
const status = "pending"; // or "reviewed" or omit for all
const response = await fetch(
  `http://localhost:5000/api/review-requests?status=${status}&limit=50&offset=0`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Success Response (200)
{
  "requests": [
    {
      "id": "673a4d5e6f7890123460",
      "predictionId": "673a2b3c4d5e6f7890123456",
      "patientId": "673a1b2c3d4e5f6789012345",
      "dermatologistId": "673a3c4d5e6f7890123458",
      "status": "reviewed",
      "comment": "This appears to be moderate acne. I recommend using benzoyl peroxide...",
      "createdAt": "2025-11-17T11:00:00Z",
      "reviewedAt": "2025-11-17T14:30:00Z",
      "patientUsername": "john_doe",
      "dermatologistUsername": "dr_smith"
    },
    {
      "id": "673a4d5e6f7890123461",
      "predictionId": "673a2b3c4d5e6f7890123457",
      "patientId": "673a1b2c3d4e5f6789012345",
      "dermatologistId": "673a3c4d5e6f7890123459",
      "status": "pending",
      "comment": null,
      "createdAt": "2025-11-17T12:00:00Z",
      "reviewedAt": null,
      "patientUsername": "john_doe",
      "dermatologistUsername": "dr_johnson"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

**Display Ideas**:
- **Pending**: Show "Waiting for Dr. [dermatologistUsername]" with date
- **Reviewed**: Show dermatologist name, review date, and "View Review" button
- Color code: Yellow/Orange for pending, Green for reviewed

### 9. View Single Review Request Details

**Endpoint**: `GET /api/review-requests/{id}`

```javascript
// Request
const token = localStorage.getItem('token');
const requestId = "673a4d5e6f7890123460";
const response = await fetch(
  `http://localhost:5000/api/review-requests/${requestId}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Success Response (200)
{
  "id": "673a4d5e6f7890123460",
  "predictionId": "673a2b3c4d5e6f7890123456",
  "patientId": "673a1b2c3d4e5f6789012345",
  "dermatologistId": "673a3c4d5e6f7890123458",
  "status": "reviewed",
  "comment": "Based on my analysis, this is moderate acne vulgaris. I recommend:\n1. Use benzoyl peroxide 2.5% daily\n2. Maintain good facial hygiene\n3. Avoid touching your face\n4. Schedule follow-up in 4 weeks if no improvement",
  "createdAt": "2025-11-17T11:00:00Z",
  "reviewedAt": "2025-11-17T14:30:00Z",
  "patientUsername": "john_doe",
  "dermatologistUsername": "dr_smith"
}
```

**Display Screen**:
- Show prediction image (fetch from `/api/predictions` or store predictionId)
- AI diagnosis (from original prediction)
- Status badge (Pending/Reviewed/Rejected)
- Dermatologist info
- **Expert Review** section: Show `comment` (preserve line breaks with CSS `white-space: pre-wrap`)
- Timestamps

**Review Request Statuses**:
- `pending`: Waiting for dermatologist response
- `reviewed`: Dermatologist submitted expert review
- `rejected`: Dermatologist declined the request (with reason in `comment` field)

---

## Dermatologist Workflows

### 10. View Assigned Review Requests (Dashboard)

**Endpoint**: `GET /api/review-requests` (same as patient, but role-filtered)

```javascript
// Dermatologist sees only requests assigned to them
const token = localStorage.getItem('token');
const response = await fetch(
  `http://localhost:5000/api/review-requests?status=pending&limit=50&offset=0`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Response: Same structure as patient view, but filtered to dermatologist's ID
{
  "requests": [
    {
      "id": "673a4d5e6f7890123461",
      "predictionId": "673a2b3c4d5e6f7890123457",
      "patientId": "673a1b2c3d4e5f6789012345",
      "dermatologistId": "673a3c4d5e6f7890123458", // current user's ID
      "status": "pending",
      "comment": null,
      "createdAt": "2025-11-17T12:00:00Z",
      "reviewedAt": null,
      "patientUsername": "john_doe",
      "dermatologistUsername": "dr_smith"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

**Dashboard UI**:
- **Tabs**: "Pending" and "Reviewed"
- Show patient name, date requested, and "Review Case" button
- Badge showing total pending count

### 11. Submit Expert Review

**Endpoint**: `POST /api/review-requests/{id}/review`

```javascript
// Request
const token = localStorage.getItem('token');
const requestId = "673a4d5e6f7890123461";
const response = await fetch(
  `http://localhost:5000/api/review-requests/${requestId}/review`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment: "Based on my analysis, this is moderate acne vulgaris. I recommend:\n1. Use benzoyl peroxide 2.5% daily\n2. Maintain good facial hygiene\n3. Avoid touching your face\n4. Schedule follow-up in 4 weeks if no improvement"
    })
  }
);

// Success Response (200)
{
  "id": "673a4d5e6f7890123461",
  "predictionId": "673a2b3c4d5e6f7890123457",
  "patientId": "673a1b2c3d4e5f6789012345",
  "dermatologistId": "673a3c4d5e6f7890123458",
  "status": "reviewed", // Changed from pending
  "comment": "Based on my analysis...",
  "createdAt": "2025-11-17T12:00:00Z",
  "reviewedAt": "2025-11-17T15:00:00Z", // Now populated
  "patientUsername": "john_doe",
  "dermatologistUsername": "dr_smith"
}

// Error Responses
// 400 - Already reviewed
{
  "error": "This request has already been reviewed"
}

// 403 - Not assigned to you
{
  "error": "You are not assigned to this request"
}
```

**UI Flow**:
1. Show prediction image and AI diagnosis
2. Text area for review (1-2000 characters)
3. "Submit Review" button
4. On success: Show confirmation, patient receives notification
5. Move to "Reviewed" tab

### 11b. Reject Review Request (Dermatologist)

**Endpoint**: `POST /api/review-requests/{id}/reject`

```javascript
// Request
const token = localStorage.getItem('token');
const requestId = "673a4d5e6f7890123461";
const response = await fetch(
  `http://localhost:5000/api/review-requests/${requestId}/reject`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment: "I specialize in melanoma cases. Please consult a general dermatologist for acne concerns."
    })
  }
);

// Success Response (200)
{
  "id": "673a4d5e6f7890123461",
  "predictionId": "673a2b3c4d5e6f7890123457",
  "patientId": "673a1b2c3d4e5f6789012345",
  "dermatologistId": "673a3c4d5e6f7890123458",
  "status": "rejected", // Changed from pending
  "comment": "I specialize in melanoma cases...",
  "createdAt": "2025-11-17T12:00:00Z",
  "reviewedAt": "2025-11-17T13:00:00Z", // Now populated
  "patientUsername": "john_doe",
  "dermatologistUsername": "dr_smith"
}

// Error Responses
// 400 - Already reviewed/rejected
{
  "error": "This request has already been reviewed"
}

// 403 - Not assigned to you
{
  "error": "You are not assigned to this request"
}
```

**UI Flow**:
1. Show "Reject Request" button alongside "Submit Review" button
2. On reject click: Show confirmation dialog with reason text area
3. On confirm: Submit rejection with reason
4. Patient receives `review_rejected` notification + email
5. Move to "Reviewed" tab (dermatologist can see rejected in history)

**Use Cases**:
- Dermatologist specializes in different condition type
- Image quality insufficient for proper diagnosis
- Request outside dermatologist's expertise
- Dermatologist unavailable to review in timely manner

---

## Notification System

### 12. Get Notifications

**Endpoint**: `GET /api/notifications`

```javascript
// Request
const token = localStorage.getItem('token');
const unreadOnly = true; // or false for all
const response = await fetch(
  `http://localhost:5000/api/notifications?unreadOnly=${unreadOnly}&limit=50&offset=0`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Success Response (200)
{
  "notifications": [
    {
      "id": "673a5e6f7890123462",
      "userId": "673a1b2c3d4e5f6789012345",
      "type": "review_submitted",
      "message": "Dr. dr_smith added a review to your prediction",
      "ref": {
        "requestId": "673a4d5e6f7890123460",
        "predictionId": "673a2b3c4d5e6f7890123456"
      },
      "isRead": false,
      "createdAt": "2025-11-17T14:30:00Z"
    },
    {
      "id": "673a5e6f7890123463",
      "userId": "673a3c4d5e6f7890123458",
      "type": "review_requested",
      "message": "New review request from john_doe",
      "ref": {
        "requestId": "673a4d5e6f7890123461",
        "predictionId": "673a2b3c4d5e6f7890123457"
      },
      "isRead": true,
      "createdAt": "2025-11-17T12:00:00Z"
    }
  ],
  "total": 10,
  "unreadCount": 3,
  "limit": 50,
  "offset": 0
}
```

**Notification Types**:
- `review_requested`: Sent to dermatologist when patient creates request
- `review_submitted`: Sent to patient when dermatologist submits review
- `review_rejected`: Sent to patient when dermatologist rejects/denies request

**UI Implementation**:
- Bell icon in navbar with badge showing `unreadCount`
- Dropdown/page showing notifications
- Bold unread, normal text for read
- Click notification → navigate to review request detail
- Show relative time ("5 minutes ago", "2 hours ago")

**Notification Architecture** (Current System):
- **In-App Notifications**: Stored in MongoDB `notifications` collection
- **Email Notifications**: Sent async via Gmail SMTP (non-blocking)
- **Delivery Model**: Polling-based (not real-time WebSocket/push)
- **Frontend Strategy**: Poll `GET /api/notifications?unreadOnly=true` every 30 seconds when app active
- **Future Enhancement**: Consider WebSocket for real-time updates or FCM for mobile push notifications

### 13. Mark Notification as Read

**Endpoint**: `PATCH /api/notifications/{id}/read`

```javascript
// Request
const token = localStorage.getItem('token');
const notificationId = "673a5e6f7890123462";
const response = await fetch(
  `http://localhost:5000/api/notifications/${notificationId}/read`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Success Response (204 No Content)
// No body returned

// Then refresh notifications list to update UI
```

**When to Mark Read**:
- When user clicks on notification
- When user views the related review request page
- "Mark all as read" button

---

## Error Handling Guide

### Common Error Responses

```javascript
// 401 Unauthorized (token missing/invalid/expired)
{
  "error": "No token, authorization denied"
}
// OR
{
  "error": "Token is not valid"
}

// 403 Forbidden (insufficient permissions)
{
  "error": "Access denied. Required role: dermatologist"
}

// 404 Not Found
{
  "error": "User not found"
}
// OR
{
  "error": "Prediction not found"
}

// 400 Bad Request (validation failed)
{
  "error": "All fields are required"
}
// OR
{
  "error": "Invalid ObjectId format"
}

// 409 Conflict
{
  "error": "A review request to this dermatologist already exists for this prediction"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

### Error Handling Pattern

```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific errors
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 403) {
        // Forbidden - show error message
        throw new Error(errorData.error || 'Access denied');
      }
      
      // Generic error
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Network error or JSON parse error
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
try {
  const data = await apiRequest('http://localhost:5000/api/predictions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Handle success
} catch (error) {
  // Show error to user
  showErrorMessage(error.message);
}
```

---

## React/Vue/Angular Examples

### React Native Example - Token Management with AsyncStorage

```javascript
// utils/tokenHelper.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Check if token expires in next 5 minutes (buffer)
    return decoded.exp < (currentTime + 300);
  } catch {
    return true;
  }
};

export const getValidToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      // Clear storage and return null
      await AsyncStorage.multiRemove(['token', 'userId', 'userRole', 'username']);
      return null;
    }
    return token;
  } catch (error) {
    console.error('Token retrieval error:', error);
    return null;
  }
};

export const saveAuthData = async (token, user) => {
  try {
    await AsyncStorage.multiSet([
      ['token', token],
      ['userId', user.id],
      ['userRole', user.role],
      ['username', user.username]
    ]);
  } catch (error) {
    console.error('Failed to save auth data:', error);
  }
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove(['token', 'userId', 'userRole', 'username']);
};
```

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getValidToken, clearAuthData } from '../utils/tokenHelper';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getValidToken();
    setIsAuthenticated(!!token);
    setLoading(false);
    
    if (!token) {
      // Navigate to login
      // navigation.navigate('Login');
    }
  };

  const logout = async () => {
    await clearAuthData();
    setIsAuthenticated(false);
    // Navigate to login
  };

  return { isAuthenticated, loading, logout, checkAuth };
};
```

```javascript
// api/client.js - API wrapper with auto token validation
import { getValidToken, clearAuthData } from '../utils/tokenHelper';

export const apiRequest = async (url, options = {}) => {
  const token = await getValidToken();
  
  if (!token) {
    // Token expired, redirect to login
    throw new Error('SESSION_EXPIRED');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Token invalid on server, clear and redirect
      await clearAuthData();
      throw new Error('SESSION_EXPIRED');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### React Example - Login Component

```jsx
import { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('username', data.user.username);

      // Redirect based on role
      window.location.href = data.user.role === 'dermatologist' 
        ? '/dermatologist/dashboard' 
        : '/patient/dashboard';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Email or Username"
        value={formData.emailOrUsername}
        onChange={(e) => setFormData({...formData, emailOrUsername: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      >
        <option value="patient">Patient</option>
        <option value="dermatologist">Dermatologist</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### React Example - Image Upload

```jsx
import { useState } from 'react';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/predictions/predict', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} />
      
      {preview && <img src={preview} alt="Preview" style={{maxWidth: '300px'}} />}
      
      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h3>Diagnosis: {result.result.predicted_label}</h3>
          <p>Confidence: {(result.result.confidence_score * 100).toFixed(1)}%</p>
          <img src={result.imageUrl} alt="Analyzed" style={{maxWidth: '300px'}} />
          <button onClick={() => {/* Navigate to request review with result.id */}}>
            Request Expert Review
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Important Notes

### Token Management
- **Store token securely**: Use `localStorage` (web) or `AsyncStorage` (React Native)
- **Include in all requests**: Add `Authorization: Bearer ${token}` header
- **Handle expiration**: Token expires after **7 days** - redirect to login on 401
- **Multi-device support**: Users can login from multiple devices (web + mobile) simultaneously - each device gets its own independent token
- **Clear on logout**: `localStorage.clear()` or remove specific items
- **Token validation**: Frontend should check token expiration before requests to auto-logout gracefully

### Image Handling
- **Accepted formats**: JPG, JPEG, PNG only
- **File size**: No hard limit in backend, but recommend < 5MB for UX
- **Storage**: Images uploaded to Cloudinary (cloud storage), not local server
- **Display**: Use `imageUrl` from response directly in `<img src={imageUrl}>` (secure HTTPS URLs)
- **Validation**: Backend automatically checks for blur (threshold: 100) and face detection before processing

### Date Formatting
- Backend returns ISO 8601 format: `"2025-11-17T10:30:00Z"`
- Convert for display:
```javascript
const date = new Date(createdAt);
const formatted = date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
// Output: "Nov 17, 2025, 10:30 AM"
```

### Polling for Notifications (Recommended)
```javascript
// Poll every 30 seconds for new notifications
useEffect(() => {
  const interval = setInterval(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch('http://localhost:5000/api/notifications?unreadOnly=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### CORS Note
- Backend allows all origins in development
- If you get CORS errors, check that:
  - You're using the correct URL (http://localhost:5000)
  - Token is properly formatted: `Bearer ${token}` (note the space)

---

## Testing Checklist

### Patient Flow
- [ ] Register new patient account
- [ ] Login and token stored
- [ ] Upload image (test valid, blurry, no-face, wrong format)
- [ ] View prediction result with image
- [ ] View prediction history
- [ ] List dermatologists with search
- [ ] Request review from dermatologist
- [ ] View pending request
- [ ] Receive notification when review submitted
- [ ] View completed review with expert comment

### Dermatologist Flow
- [ ] Register dermatologist account
- [ ] Login and verify role
- [ ] Receive notification for new request
- [ ] View pending requests dashboard
- [ ] Open request and see patient's image
- [ ] Submit review with comment
- [ ] Reject request with reason
- [ ] View in reviewed/rejected tab
- [ ] Cannot submit/reject review twice

### Multi-Device & Token Management
- [ ] Login from web browser - token stored
- [ ] Login from mobile app simultaneously - second token works
- [ ] Both tokens work independently for 7 days
- [ ] Token expiration handled gracefully (auto-logout at 7 days)
- [ ] Frontend checks token expiration before requests

### Notification System
- [ ] Patient receives notification when review submitted
- [ ] Patient receives notification when review rejected
- [ ] Dermatologist receives notification for new request
- [ ] Unread count badge updates correctly
- [ ] Email notifications sent (check spam folder if not in inbox)
- [ ] Polling updates notifications every 30 seconds

### Error Scenarios
- [ ] Login with wrong credentials
- [ ] Upload without authentication
- [ ] Upload invalid file type
- [ ] Request review for non-existent prediction
- [ ] Duplicate review request
- [ ] Patient tries to submit review (should fail)
- [ ] Token expiration handling
- [ ] Dermatologist tries to review another dermatologist's request

---

## Quick Reference - All Endpoints

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/users/me` | Any | Profile |
| GET | `/api/users/dermatologists` | Any | List derms |
| POST | `/api/predictions/predict` | Patient | Upload image |
| GET | `/api/predictions` | Patient | History |
| POST | `/api/review-requests` | Patient | Request review |
| GET | `/api/review-requests` | Any | List requests |
| GET | `/api/review-requests/{id}` | Owner/Derm | View request |
| POST | `/api/review-requests/{id}/review` | Derm | Submit review |
| POST | `/api/review-requests/{id}/reject` | Derm | Reject request |
| GET | `/api/notifications` | Any | List notifications |
| PATCH | `/api/notifications/{id}/read` | Owner | Mark read |

---

## Recent Updates (November 2025)

### Token & Authentication
- ✅ JWT tokens now valid for **7 days** (increased from 1 day)
- ✅ Multi-device login supported (web + mobile can be logged in simultaneously)
- ✅ Each device gets independent token - all work concurrently
- ✅ React Native AsyncStorage examples added with token validation helpers

### Review Request Workflow
- ✅ Dermatologists can now **reject** review requests with reason
- ✅ New status: `rejected` (alongside `pending` and `reviewed`)
- ✅ Patients receive `review_rejected` notification + email when request denied
- ✅ Review request detail endpoint enriched with prediction data and patient name

### Notification System
- ✅ Three notification types: `review_requested`, `review_submitted`, `review_rejected`
- ✅ Polling-based architecture documented (30-second intervals recommended)
- ✅ Email notifications via Gmail SMTP (async, non-blocking)
- ✅ Future enhancement path: WebSocket/FCM push notifications

### Image Storage
- ✅ Images uploaded to **Cloudinary** (cloud storage, not local)
- ✅ Secure HTTPS URLs returned in `imageUrl` field
- ✅ Automatic validation: blur detection + face detection before processing

---

## Need Help?

- **API Documentation**: http://localhost:5000/docs (interactive Swagger UI)
- **Test with Postman**: Import endpoints from Swagger UI
- **Sample Test Script**: `test_workflow.ps1` (simulates full patient-dermatologist flow)

Good luck with the integration! 🚀
