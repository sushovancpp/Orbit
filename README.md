# ⊙ Orbit — Social Platform

A full-stack social platform combining the best of Instagram, X (Twitter), and Discord.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT, Passport.js (Google & GitHub OAuth) |
| Media | Cloudinary (images, videos, stories, reels) |
| Real-time | Socket.io (chat, notifications, presence) |
| Video Calls | WebRTC + Socket.io signaling |
| Deploy | Docker + Nginx |

---

## Project Structure

```
orbit/
├── backend/
│   ├── config/          # DB, Cloudinary, Passport
│   ├── controllers/     # Auth, Posts, Users, Chats, Stories, Admin
│   ├── middleware/      # JWT auth, rate limiter
│   ├── models/          # User, Post, Story, Chat, Notification
│   ├── routes/          # All REST API routes
│   ├── sockets/         # Socket.io — chat, WebRTC, presence
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Post, Story, Chat, UI primitives
│   │   ├── hooks/       # useWebRTC, useSocket, useTheme, useInfiniteScroll
│   │   ├── pages/       # Feed, Explore, Profile, Chat, Reels, Admin…
│   │   ├── services/    # Axios API client, Socket singleton
│   │   └── store/       # Zustand: authStore, notifStore
│   └── index.html
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local)

### 1. Clone and install

```bash
git clone <your-repo>
cd orbit
npm run install:all
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

Required `.env` values:

```env
MONGO_URI=mongodb://localhost:27017/orbit
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# or with Docker
docker run -d -p 27017:27017 --name orbit-mongo mongo:7
```

### 4. Run dev servers

```bash
npm run dev
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

---

## Docker (Production)

```bash
cp backend/.env.example backend/.env
# Fill in all .env values

docker-compose up --build -d
# App: http://localhost
```

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Posts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/posts/feed` | Paginated home feed |
| POST | `/api/posts` | Create post (multipart) |
| GET | `/api/posts/:id` | Get single post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| POST | `/api/posts/:id/poll/vote` | Vote on poll |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/suggested` | Suggested to follow |
| GET | `/api/users/:username` | Get profile + posts |
| PUT | `/api/users/me` | Update profile |
| POST | `/api/users/:id/follow` | Follow/unfollow |

### Stories
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/stories` | Feed stories |
| POST | `/api/stories` | Create story |
| POST | `/api/stories/:id/view` | Mark as viewed |
| DELETE | `/api/stories/:id` | Delete story |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/chats` | User's chat list |
| GET | `/api/chats/:id/messages` | Load messages |
| POST | `/api/chats/dm` | Start/get DM |
| POST | `/api/chats/group` | Create group chat |

### Explore
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/explore/trending` | Trending posts |
| GET | `/api/explore/search?q=&type=` | Search posts/users/hashtags |
| GET | `/api/explore/reels` | Reels feed |

---

## Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `chat:send` | `{ chatId, content, media }` | Send message |
| `chat:typing` | `{ chatId }` | Typing indicator |
| `chat:read` | `{ chatId }` | Mark messages read |
| `call:offer` | `{ to, offer, type }` | Initiate WebRTC call |
| `call:answer` | `{ to, answer }` | Accept call |
| `call:ice-candidate` | `{ to, candidate }` | ICE candidate |
| `call:end` | `{ to }` | End call |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `chat:message` | `{ chatId, message }` | New message |
| `chat:typing` | `{ chatId, user }` | Someone is typing |
| `chat:read` | `{ chatId, userId }` | Messages read |
| `notification` | `{ type }` | New notification |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |
| `call:offer` | `{ from, fromUser, offer, type }` | Incoming call |
| `call:answer` | `{ from, answer }` | Call answered |
| `call:end` | `{ from }` | Call ended |

---

## Phases Roadmap

- [x] **Phase 1 — MVP**: Auth (JWT + OAuth), Profiles, Posts, Likes/Comments, Stories
- [x] **Phase 2 — Social**: Follow system, Explore/Search, Notifications, Suggested users
- [x] **Phase 3 — Real-time**: Live chat, WebRTC video/audio calls, Socket presence
- [x] **Phase 4 — Advanced**: Reels, Polls, Admin dashboard, Rate limiting, Dark mode
- [x] **Phase 5 — DevOps**: Docker, Nginx, Production build pipeline

---

## Environment Variables

See `backend/.env.example` for the full list.

## License

MIT
