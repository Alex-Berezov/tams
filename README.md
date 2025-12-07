# T.A.M.S - Tokyo Anomaly Monitoring System

Real-time monitoring dashboard for spiritual anomalies (yokai) across Tokyo.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-red)

## 📋 Features

- **Real-time Monitoring**: Track yokai activity across Tokyo districts
- **Threat Level Indicators**: Visual color-coded threat levels (Low → Critical)
- **Capture System**: Dispatch capture teams with optimistic UI updates
- **Live Updates**: Server-Sent Events (SSE) for real-time threat level changes
- **Toast Notifications**: Instant feedback on capture success/failure

## 🏗️ Architecture

This project follows **Feature Sliced Design (FSD)** methodology:

```
src/
├── app/                 # Next.js App Router (pages, layouts, providers)
│   ├── api/             # API Routes (anomalies, capture, SSE stream)
│   └── monitoring/      # Main monitoring page
├── widgets/             # Composite UI blocks
│   ├── anomaly-list/    # List of anomaly cards
│   └── notification-container/
├── features/            # Business features
│   ├── capture-anomaly/ # Capture mutation with optimistic updates
│   └── realtime-updates/# SSE subscription hook
├── entities/            # Business entities
│   └── anomaly/         # Anomaly card UI and types
└── shared/              # Reusable code
    ├── api/             # API client
    ├── config/          # Query keys, constants
    ├── lib/             # Helper functions
    ├── styles/          # SCSS variables, mixins, globals
    ├── types/           # TypeScript types & Zod schemas
    └── ui/              # UI components (Button, Card, Badge, Toast)
```

### FSD Import Rules

Imports follow strict top-down hierarchy:

- `app` → `widgets` → `features` → `entities` → `shared`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Alex-Berezov/tams.git
cd tams

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000/monitoring](http://localhost:3000/monitoring)

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t tams .
docker run -p 3000:3000 tams
```

## 🛠️ Tech Stack

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| **Next.js 16**     | App Router, API Routes, SSE      |
| **React 19**       | UI Library                       |
| **TypeScript**     | Type Safety (strict mode)        |
| **TanStack Query** | Server State, Caching, Mutations |
| **Zod**            | Runtime Validation               |
| **SCSS Modules**   | Scoped Styling                   |

## 📡 API Endpoints

| Endpoint                      | Method | Description                           |
| ----------------------------- | ------ | ------------------------------------- |
| `/api/anomalies`              | GET    | Fetch all anomalies                   |
| `/api/anomalies/[id]/capture` | POST   | Capture an anomaly (30% failure rate) |
| `/api/anomalies/stream`       | GET    | SSE stream for real-time updates      |

## 🎮 Usage

1. **View Anomalies**: The monitoring page displays all active yokai with their threat levels
2. **Capture**: Click "Capture" to dispatch a team (70% success rate)
3. **Real-time Updates**: Threat levels change automatically every 5 seconds via SSE
4. **Notifications**: Toast messages show capture results

## 🎨 Threat Levels

| Level    | Color     | Description                 |
| -------- | --------- | --------------------------- |
| LOW      | 🟢 Green  | Minor spiritual disturbance |
| MEDIUM   | 🟡 Yellow | Moderate anomaly activity   |
| HIGH     | 🟠 Orange | Significant threat detected |
| CRITICAL | 🔴 Red    | Immediate action required   |

## 📝 Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📁 Project Structure Details

### Shared Layer

- **UI Components**: Button, Card, Badge, Toast system
- **API Client**: Fetch wrapper with timeout, error handling
- **Types**: Anomaly, ThreatLevel, AnomalyStatus (with Zod schemas)
- **Styles**: SCSS variables, mixins, global styles

### Features

- **capture-anomaly**: useCaptureAnomaly hook with optimistic updates and rollback
- **realtime-updates**: useAnomalyStream hook for SSE subscription

### Widgets

- **AnomalyList**: Renders list of AnomalyCards with loading/error states
- **NotificationContainer**: Manages toast notifications position

## 📄 License

MIT
