# 🎲 Cube Clash - Multiplayer Rubik's Cube Solver Game

<div align="center">

![Cube Clash](https://img.shields.io/badge/Cube%20Clash-Multiplayer-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Redis](https://img.shields.io/badge/Redis-5.8-red?style=for-the-badge&logo=redis)

**The Ultimate Real-Time Multiplayer Rubik's Cube Competition Platform**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-endpoints)

</div>

---

## 📖 About

**Cube Clash** is a real-time multiplayer web application where players compete head-to-head to solve Rubik's cubes. Challenge players worldwide, improve your solving speed, and climb the leaderboards in this competitive cube-solving experience.

### Key Highlights

- 🎮 **Real-Time Multiplayer**: Compete against players in live matches
- 🎯 **Matchmaking System**: Intelligent queue system for finding opponents
- 🏆 **Rating System**: Track your performance with ELO-style ratings
- 📊 **Statistics**: Monitor wins, win percentage, and best solve times
- 🎨 **3D Cube Visualization**: Interactive 3D Rubik's cube using Three.js
- ⚡ **WebSocket Communication**: Low-latency real-time game synchronization
- 🔐 **User Authentication**: Secure login/signup with JWT tokens

---

## ✨ Features

### Game Features
- **Multiple Cube Variants**: Support for 3x3 and 4x4 cubes
- **Synchronized Scrambles**: Both players receive the same scramble
- **Real-Time Moves**: See opponent's moves as they happen
- **Keyboard Controls**: Intuitive keyboard shortcuts (U, R, F, D, L, B)
- **Win Detection**: Automatic game completion detection
- **Room System**: Private rooms for matches

### User Features
- **User Accounts**: Sign up and login system
- **Player Profiles**: Track rating, wins, and statistics
- **Guest Mode**: Play without registration
- **Match History**: View your performance metrics
- **Top Speeds**: Record your best solve times per cube category

### Technical Features
- **Redis Matchmaking**: Fast player matching using Redis queues
- **WebSocket Server**: Dedicated WebSocket server for real-time communication
- **MongoDB Integration**: Persistent user data storage
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Modern UI with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Three.js** - 3D cube rendering
- **React Three Fiber** - React renderer for Three.js
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **WebSocket Server** - Real-time communication (Node.js + ws)
- **Redis 5.8** - Matchmaking queues and room management
- **MongoDB** - User data persistence
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Docker** - Containerization for Redis
- **TypeScript** - Type checking

---

## 📁 Project Structure

```
game/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── add_user/
│   │   │   ├── get_user/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── matchmake/     # Matchmaking endpoints
│   │   │   ├── remove_player/
│   │   │   ├── room/
│   │   │   └── signup/
│   │   ├── cube/              # Cube practice page
│   │   ├── login/             # Login page
│   │   ├── queue/             # Matchmaking queue page
│   │   ├── room/              # Game room pages
│   │   └── signup/            # Signup page
│   ├── components/            # React components
│   │   ├── cube.ts            # Cube logic
│   │   ├── LandingPage.tsx    # Home page
│   │   ├── RubiksCubeViewer.tsx # 3D cube viewer
│   │   └── ...
│   ├── lib/                   # Configuration
│   ├── modals/                # Data models
│   │   ├── player.ts
│   │   ├── room.ts
│   │   └── user.ts
│   ├── server/                # WebSocket server
│   │   ├── websocket-server.ts
│   │   └── ws_main.ts
│   ├── services/              # Business logic
│   │   └── game.ts
│   ├── types/                 # TypeScript types
│   │   └── game-events.ts
│   └── utils/                 # Utility functions
│       ├── auth.ts
│       ├── cube_helper.ts
│       ├── db.ts
│       ├── jwt.ts
│       ├── redis.ts
│       └── websocket-manager.ts
├── docker-compose.yml         # Redis container setup
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** (for Redis) or local Redis installation
- **MongoDB** (local or cloud instance)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Rubik_Cube_Solver/game
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cube-clash

# Redis
REDIS_URL=redis://localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here

# WebSocket
WEBSOCKET_PORT=8002
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8002

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 4: Start Redis with Docker

```bash
docker-compose up -d
```

Or use a local Redis instance if you have one installed.

### Step 5: Start MongoDB

Ensure MongoDB is running on your system or configure a cloud MongoDB connection.

---

## 🎮 Usage

### Development Mode

1. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Start the WebSocket server** (in a separate terminal):
   ```bash
   npm run ws:dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Start the WebSocket server:**
   ```bash
   npm run ws:build
   node dist/server/ws_main.js
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run ws:dev          # Start WebSocket server in watch mode

# Building
npm run build           # Build Next.js app
npm run ws:build       # Build WebSocket server

# Testing
npm test                # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage
npm run ws:test        # Test WebSocket server
npm run test:redis     # Test Redis connection

# Linting
npm run lint            # Run ESLint
```

---

## 🎯 How to Play

1. **Sign Up / Login**: Create an account or login to track your stats
2. **Choose Variant**: Select 3x3 or 4x4 cube
3. **Find Match**: Click "Find Match" to enter the matchmaking queue
4. **Wait for Opponent**: System will match you with another player
5. **Solve the Cube**: 
   - Use keyboard shortcuts: `U`, `R`, `F`, `D`, `L`, `B` for clockwise
   - Hold `Shift` + key for counter-clockwise
   - First to solve wins!
6. **View Results**: Check your updated rating and statistics

### Keyboard Controls

| Key | Action |
|-----|--------|
| `U` | Rotate Up face clockwise |
| `R` | Rotate Right face clockwise |
| `F` | Rotate Front face clockwise |
| `D` | Rotate Down face clockwise |
| `L` | Rotate Left face clockwise |
| `B` | Rotate Back face clockwise |
| `Shift + Key` | Rotate counter-clockwise |

---

## 🔌 API Endpoints

### Authentication

- `POST /api/signup` - Create a new user account
- `POST /api/login` - Authenticate user
- `POST /api/logout` - Logout user
- `GET /api/get_user` - Get user information

### Matchmaking

- `POST /api/matchmake/start` - Start matchmaking
- `GET /api/matchmake/poll` - Poll for match status

### Rooms

- `GET /api/room/[roomId]` - Get room information
- `POST /api/remove_player` - Remove player from room
- `POST /api/add_user` - Add user to system

---

## 🧪 Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific test suites
npm run ws:test        # WebSocket server tests
npm run test:redis     # Redis connection tests

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🏗 Architecture

### Matchmaking Flow

1. Player requests match via `/api/matchmake/start`
2. System checks Redis for waiting players
3. If match found → Create room and start game
4. If no match → Add player to queue
5. When second player joins → Match created

### Game Flow

1. Both players join room
2. WebSocket connection established
3. Scrambled cube generated and sent to both players
4. Players make moves (sent via WebSocket)
5. Moves broadcasted to opponent in real-time
6. First to solve wins → Rating updated

### Data Flow

- **MongoDB**: User accounts, statistics
- **Redis**: Active rooms, matchmaking queues, player states
- **WebSocket**: Real-time game events, move synchronization

---

## 🔧 Configuration

### Redis Configuration

Redis is used for:
- Matchmaking queues (`mm:{variant}:waiting`)
- Room management (`rooms` hash)
- Player-to-room mapping (`player:room` hash)

### WebSocket Events

- `GameStarted` - Game begins
- `GameFinished` - Game ends with winner
- `KeyBoardButtonPressed` - Player move made

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- 3D rendering powered by [Three.js](https://threejs.org/)
- Real-time communication via WebSockets
- Matchmaking powered by Redis

---

## 📧 Contact

For questions, issues, or contributions, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for cube enthusiasts**

⭐ Star this repo if you find it helpful!

</div>
