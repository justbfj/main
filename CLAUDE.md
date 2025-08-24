# BFGeo - Geospatial Flight Planning Platform

## Project Overview
Web-based geospatial platform for optimizing airborne surveying flight planning through intelligent analysis of weather patterns and airspace restrictions.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Mapping**: Leaflet with React-Leaflet
- **UI Components**: Material-UI v5 or Ant Design
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js with TypeScript
- **API**: REST + GraphQL (Apollo Server)
- **Real-time**: Socket.io
- **Auth**: JWT with refresh tokens
- **Job Queue**: Bull with Redis
- **Testing**: Jest + Supertest

### Data Storage
- **Primary DB**: PostgreSQL 15+ with PostGIS extension
- **Time-series**: TimescaleDB
- **Cache**: Redis 7+
- **File Storage**: AWS S3 or MinIO
- **Search**: Elasticsearch (optional)

### Infrastructure
- **Container**: Docker with Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **API Gateway**: Kong or Nginx

## Key Components

### 1. Project Management System
- CRUD operations for flight planning projects
- Version control and collaborative editing
- Auto-save functionality

### 2. Geospatial Data Handler
- **Supported Formats**: CSV, Shapefile, GeoJSON, KML/KMZ, GPX
- **Processing Pipeline**: Upload → Validation → Format detection → CRS transformation → Spatial indexing → PostGIS storage

### 3. Interactive Mapping Engine
- Multi-layer support with toggle controls
- Drawing tools for flight line creation/editing
- Measurement tools and custom symbology
- 3D terrain visualization (optional)

### 4. Weather Intelligence Agent
- **Data Sources**: NOAA Weather API, OpenWeatherMap API, ERA5 Reanalysis Data
- Historical climate data, forecasts, severe weather alerts
- Optimal flight window recommendations

### 5. Airspace Intelligence Agent
- **Data Sources**: FAA SWIM, AirMap API, OpenSky Network
- Real-time traffic, NOTAMs, TFRs, controlled airspace
- Compliance requirements and permit information

### 6. Flight Plan Optimizer
- Multi-objective optimization algorithm
- Considers weather windows, airspace availability, fuel efficiency, time constraints
- Vehicle Routing Problem (VRP) solver

## Development Commands

```bash
# Development environment
docker-compose up -d

# Frontend development
npm run dev           # Start dev server
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Lint code
npm run typecheck     # TypeScript type checking

# Backend development
npm run dev           # Start dev server
npm run build         # Build TypeScript
npm run test          # Run tests
npm run lint          # Lint code
npm run typecheck     # TypeScript type checking
```

## API Structure

### REST Endpoints
- `GET/POST /api/projects` - Project CRUD
- `POST /api/projects/:id/upload` - File upload
- `GET/PUT/DELETE /api/projects/:id/layers/:layerId` - Layer management
- `POST /api/projects/:id/analyze` - Trigger analysis
- `GET /api/projects/:id/plan` - Get optimized plan

### GraphQL
- Real-time subscriptions for project updates
- Complex queries for related data
- Mutations for analysis and optimization

## Database Schema

### Key Tables
- `projects` - Project metadata with PostGIS bbox
- `flight_lines` - Flight paths with LINESTRING geometry
- `weather_data` - TimescaleDB hypertable for weather cache

## Development Phases

1. **MVP (3 months)**: Basic project management, CSV/GeoJSON upload, simple mapping, basic weather
2. **Core Features (2 months)**: Full geospatial support, advanced mapping, weather/airspace agents
3. **Intelligence (2 months)**: Flight optimization, agent collaboration, real-time updates
4. **Enterprise (3 months)**: Multi-tenancy, advanced permissions, API, mobile

## Performance Targets
- Page load: < 2 seconds
- API response: < 200ms (p95)
- Map rendering: 60 FPS
- Concurrent users: 1000+

## Security Requirements
- JWT authentication with refresh tokens
- TLS 1.3 for data in transit
- AES-256 encryption at rest
- GDPR compliance
- Aviation data handling per FAA regulations

## Testing Requirements
- Unit Tests: 80% coverage
- Integration Tests: Critical paths
- E2E Tests: Main user workflows
- Tools: Jest, Supertest, Cypress/Playwright, K6, OWASP ZAP