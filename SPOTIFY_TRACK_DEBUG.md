# Spotify Track Debugging & Usage Guide

## 1. How to Test Your Backend Endpoint

### Using curl

```
curl -v --cookie "token=YOUR_JWT_TOKEN" http://localhost:8080/api/spotify/current-track
```

### Using Postman
- Set the `token` cookie in the request.
- Send a GET request to `http://localhost:8080/api/spotify/current-track`.

### Using fetch (Frontend)
```js
fetch("http://localhost:8080/api/spotify/current-track", { credentials: "include" })
  .then(res => res.json())
  .then(data => console.log(data.title)); // Track name
```

### Using axios (Frontend)
```js
axios.get("http://localhost:8080/api/spotify/current-track", { withCredentials: true })
  .then(res => console.log(res.data.title)); // Track name
```

## 2. Debugging Endpoints

- `/api/spotify/debug/jwt` — Returns decoded JWT payload from cookie.
- `/api/spotify/debug/user` — Returns user object from DB (requires valid JWT cookie).

## 3. Environment Variables

Make sure your `.env` file contains:
```
JWT_SECRET=your-secret-key
FRONTEND_URL=http://127.0.0.1:3000
```

## 4. Backend Logging

Check your backend logs for:
- JWT payload
- Spotify API responses
- Errors (missing token, expired token, etc.)

## 5. Frontend Usage

To get only the track name:
```js
const trackName = response.data.title;
```

## 6. Troubleshooting
- If you get a 401 error, check that your JWT cookie is present and valid.
- Use `/api/spotify/debug/jwt` to verify the JWT payload includes `spotifyAccessToken`.
- Use `/api/spotify/debug/user` to verify the user object has a valid `spotify_access_token`.
- Ensure your frontend always sends requests with credentials/cookies included.

---
This guide will help you reliably fetch the currently playing Spotify track name from your backend.
