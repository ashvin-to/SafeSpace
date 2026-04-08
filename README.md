# SafeSpace AI – Context-Aware Safety Assistant

> Proactive Protection. Intelligent Alerts. Zero Compromise on Speed.

A modern web application for real-time personal safety with AI-powered risk analysis, intelligent route recommendations, and emergency response coordination.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm, yarn, or pnpm

### Installation

```bash
# Clone or navigate to the repository
cd /mnt/Storage/vibehack

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Start development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
safespace-ai/
├── app/                      # Next.js 14 app directory
│   ├── page.tsx             # Dashboard (main page)
│   ├── routes/              # Safe routes page
│   ├── contacts/            # Emergency contacts page
│   ├── settings/            # User settings page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── SOSButton.tsx        # Emergency SOS button
│   ├── RiskScoreCard.tsx    # Risk assessment display
│   ├── RouteCard.tsx        # Safe route recommendation
│   ├── EmergencyContactItem.tsx # Contact card
│   ├── Navigation.tsx       # Bottom navigation
│   ├── UI.tsx               # Utility components
│   └── index.ts             # Component exports
├── hooks/                   # Custom React hooks
│   └── index.ts             # useGeolocation, useRiskScore, etc.
├── lib/                     # Utility libraries (future)
├── styles/                  # Global styles
│   └── globals.css          # Tailwind CSS + custom styles
├── types/                   # TypeScript type definitions
│   └── index.ts             # RiskScore, Location, etc.
├── utils/                   # Helper functions
│   └── helpers.ts           # Risk scoring, formatting, etc.
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS theme
├── next.config.ts           # Next.js configuration
├── postcss.config.js        # PostCSS configuration
├── .eslintrc.json           # ESLint configuration
└── README.md                # This file
```

## 🎨 Design System

### Colors (Dark Theme Only)
- **Background**: `#0F1117` (Near black)
- **Card BG**: `#1C1F26` (Dark gray)
- **Accent Danger**: `#FF3B30` (Bold red - SOS, critical alerts)
- **Accent Caution**: `#FFAA00` (Amber - medium risk)
- **Accent Safe**: `#34C759` (Green - safe/confirmed)
- **Text Primary**: `#FFFFFF` (Pure white)
- **Text Secondary**: `#A1A1A6` (Medium gray)
- **Borders**: `#30363D` (Dark gray)

### Typography
- **Header XL**: 32px, Bold (700)
- **Header LG**: 24px, Semibold (600)
- **Body LG**: 18px, Regular (400)
- **Body Base**: 16px, Regular (400)
- **Body SM**: 14px, Regular (400)
- **Caption**: 12px, Medium (500)

### Components
- **SOS Button**: 88×88dp circle (mobile), animated pulse on emergency
- **Risk Score Card**: Large display with risk factors list
- **Route Card**: Recommended routes with risk visualization
- **Emergency Contact**: Quick call/edit interface

## 🔑 Key Features

### ✅ Implemented (MVP)
- [x] Dashboard with risk assessment
- [x] SOS emergency button (1-tap trigger)
- [x] Risk score display with factors
- [x] Safe route recommendations
- [x] Emergency contacts list
- [x] Navigation interface
- [x] Settings page
- [x] Responsive design (mobile-first)
- [x] Dark theme (only theme)
- [x] Real-time risk score updates (mocked)

### 🚧 In Development
- [ ] Backend API integration
- [ ] WebSocket real-time updates
- [ ] Actual location tracking
- [ ] Map integration (Mapbox)
- [ ] Emergency notification system
- [ ] AI risk scoring engine
- [ ] Route optimization algorithm

### 📋 Future Features
- [ ] Voice-activated SOS
- [ ] Live location sharing
- [ ] Predictive danger zones
- [ ] Law enforcement integration
- [ ] Web admin dashboard
- [ ] Wearable integration (smartwatch)
- [ ] Native mobile apps

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Lucide React icons
- **State**: Zustand (for future complex state)
- **Animations**: Framer Motion
- **Real-time**: Socket.io Client

### Backend (Planned)
- **Runtime**: Node.js
- **Services**:
  - Risk Analysis Service (Node.js)
  - Route Optimization Service (Python)
  - Emergency Response Service (Go)
- **Database**: PostgreSQL, MongoDB, TimescaleDB
- **Cache**: Redis
- **Streaming**: Kafka

## 🎯 Development Workflow

### Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npm run type-check
```

### Code Style
- ESLint configuration included
- TypeScript strict mode enabled
- Auto-format on save (configure in VSCode)

## 🔐 Security Features

- **Encryption**: AES-256 for sensitive data
- **TLS/HTTPS**: All communications encrypted
- **Authentication**: JWT + OAuth ready
- **Data Privacy**: Only necessary data collection
- **No tracking**: Respect user privacy

## 📱 Responsive Design

Optimized for all screen sizes:
- **Mobile** (320px - 480px): Single column, full-width
- **Tablet** (481px - 768px): 2-column grid, sidebar ready
- **Desktop** (769px+): 3-column grid, sidebar navigation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Deploy automatically via Vercel
# (Connect GitHub repo in Vercel dashboard)
```

### Docker
```bash
# Build Docker image
docker build -t safespace-ai .

# Run container
docker run -p 3000:3000 safespace-ai
```

## 📊 Performance Targets

All based on design blueprint:
- **Risk Scoring**: < 100ms (p95)
- **Route Computation**: < 200ms (p95)
- **Emergency Notification**: < 50ms (p99)
- **UI Rendering**: < 16ms (60 FPS)
- **First Contentful Paint**: < 1.5s

## 🧪 Testing (Future)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- [SAFESPACE_AI_PITCH_SLIDE.md](./SAFESPACE_AI_PITCH_SLIDE.md) – Product pitch
- [SAFESPACE_AI_TECHNICAL_BLUEPRINT.md](./SAFESPACE_AI_TECHNICAL_BLUEPRINT.md) – System architecture
- [SAFESPACE_AI_INVESTOR_PITCH.md](./SAFESPACE_AI_INVESTOR_PITCH.md) – Business model & financials
- [SAFESPACE_AI_DESIGN_SYSTEM.md](./SAFESPACE_AI_DESIGN_SYSTEM.md) – Design specifications

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Future: Authentication
# NEXT_PUBLIC_AUTH_DOMAIN=
# NEXT_PUBLIC_AUTH_CLIENT_ID=

# Future: Maps
# NEXT_PUBLIC_MAPBOX_TOKEN=
```

## 🐛 Known Issues

- Mock data used throughout (replace with real API calls)
- No actual location tracking (implement navigator.geolocation)
- WebSocket not connected (implement backend)
- Emergency contacts don't actually send notifications

## 📞 Support

For questions or issues:
1. Check [Discussions](./discussions) (when available)
2. Open an [Issue](./issues) (when available)
3. Contact: support@safespace.ai (when available)

## 📄 License

MIT License - See LICENSE file for details

---

## 🎬 Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Explore the Dashboard**
   - Visit http://localhost:3000
   - Test the SOS button
   - Browse routes and contacts

4. **Build the Backend**
   - Create Node.js API server
   - Implement risk scoring engine
   - Set up WebSocket connections

5. **Connect Real Data**
   - Integrate location services
   - Connect emergency contact system
   - Add authentication

## 💡 Future Architecture

```
┌─────────────────────────────────────┐
│     SafeSpace AI Dashboard          │
│  (This Next.js Application)         │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────────┬──────────────────┐
      ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Risk Engine  │  │ Route Opt.   │  │ Emergency    │
│ (Node.js)    │  │ (Python)     │  │ Response     │
└──────┬───────┘  └──────┬───────┘  │ (Go)         │
       │                 │          └──────┬───────┘
       └─────────────────┼──────────────────┘
                         │
                  ┌──────┴──────────┬────────────────┐
                  ▼                 ▼                ▼
            ┌──────────┐      ┌──────────┐     ┌────────┐
            │PostgreSQL│      │MongoDB   │     │Redis   │
            └──────────┘      └──────────┘     └────────┘
```

---

**SafeSpace AI: Because your safety shouldn't wait for an emergency.**

Made with ❤️ for personal safety and rapid deployment.
