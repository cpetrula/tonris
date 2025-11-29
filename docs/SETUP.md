# TONRIS Developer Setup Guide

This guide will help you set up the TONRIS development environment on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

| Software | Minimum Version | Purpose |
|----------|-----------------|---------|
| Node.js | v18.0.0+ | JavaScript runtime |
| npm | v9.0.0+ | Package manager |
| MySQL | v8.0+ | Database |
| Git | v2.30+ | Version control |

### Verify Installation

```bash
node --version    # Should output v18.x.x or higher
npm --version     # Should output v9.x.x or higher
mysql --version   # Should output Ver 8.x.x or higher
git --version     # Should output 2.x.x or higher
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/tonris.git
cd tonris
```

### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `backend/.env` with your local settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tonris_db
DB_USER=root
DB_PASSWORD=your_local_password

# Logging
LOG_LEVEL=debug

# Multi-tenant
DEFAULT_TENANT_ID=default

# JWT (generate secure random strings for production)
JWT_SECRET=local-dev-secret-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Set Up Database

```bash
# Login to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE tonris_db;
EXIT;
```

The application will auto-sync the schema on first run in development mode.

### 5. Start Backend Server

```bash
# Development mode with hot-reload
npm run dev
```

The server should start on `http://localhost:3000`.

### 6. Verify Backend

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 7. Set Up Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 8. Configure Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 9. Start Frontend Server

```bash
# Development mode
npm run dev
```

The frontend should start on `http://localhost:5173`.

### 10. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## External Service Setup (Optional)

For full functionality, configure the following services:

### Stripe (Payments)

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from Dashboard → Developers → API keys
3. Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
```

4. Create price products in Stripe Dashboard for testing

### Twilio (Telephony)

1. Create a Twilio account at https://twilio.com
2. Get credentials from Twilio Console
3. Add to `.env`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
APP_BASE_URL=http://localhost:3000
```

4. For local webhook testing, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Update APP_BASE_URL with ngrok URL
APP_BASE_URL=https://xxxxx.ngrok.io
```

### OpenAI (AI)

1. Create an OpenAI account at https://platform.openai.com
2. Generate an API key
3. Add to `.env`:

```env
OPENAI_API_KEY=sk-your_api_key
OPENAI_MODEL=gpt-4
```

### ElevenLabs (Voice)

1. Create an ElevenLabs account at https://elevenlabs.io
2. Get API credentials
3. Add to `.env`:

```env
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_VOICE_ID=your_voice_id
```

## Project Structure

```
tonris/
├── backend/
│   ├── src/
│   │   ├── app.js              # Entry point
│   │   ├── config/             # Configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Sequelize models
│   │   ├── modules/            # Feature modules
│   │   ├── routes/             # Route definitions
│   │   └── utils/              # Utilities
│   ├── tests/                  # Test files
│   ├── .env.example            # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.ts             # Entry point
│   │   ├── App.vue             # Root component
│   │   ├── router/             # Vue Router
│   │   ├── stores/             # Pinia stores
│   │   ├── services/           # API services
│   │   ├── layouts/            # Layout components
│   │   ├── pages/              # Page components
│   │   └── components/         # Reusable components
│   ├── public/                 # Static assets
│   └── package.json
├── docs/                       # Documentation
└── README.md
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Run tests with coverage
npm test -- --coverage
```

### Linting

```bash
# Backend linting
cd backend
npm run lint

# Fix lint issues
npm run lint -- --fix
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Preview production build
npm run preview
```

## Common Development Tasks

### Creating a New Module

1. Create module directory in `backend/src/modules/`:

```
modules/new-module/
├── index.js           # Exports
├── newModule.model.js # Sequelize model
├── newModule.service.js # Business logic
├── newModule.controller.js # Request handlers
└── newModule.routes.js # Route definitions
```

2. Register routes in `backend/src/routes/index.js`
3. Add route mounting in `backend/src/app.js`

### Adding a New Page (Frontend)

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/router/index.ts`
3. Add navigation link if needed

### Database Schema Changes

1. Modify the Sequelize model
2. In development, the schema auto-syncs
3. For production, create a migration:

```bash
npx sequelize-cli migration:generate --name add-new-field
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

1. Verify MySQL is running:
```bash
mysql.server status
# or
systemctl status mysql
```

2. Check credentials in `.env`
3. Ensure database exists

### Node Module Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure the frontend URL is allowed in CORS configuration. In development, CORS is permissive.

### JWT Token Invalid

Clear browser storage and login again:
```javascript
localStorage.clear();
```

## IDE Setup

### VS Code Extensions

Recommended extensions:

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Volar** - Vue 3 support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **MySQL** - Database management
- **Thunder Client** - API testing

### VS Code Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## API Testing

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Authenticated request
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer <your-token>" \
  -H "X-Tenant-ID: tenant-id"
```

### Using Thunder Client

1. Install Thunder Client VS Code extension
2. Import collection from `docs/thunder-collection.json` (if available)
3. Set environment variables:
   - `baseUrl`: http://localhost:3000
   - `token`: (after login)
   - `tenantId`: your-tenant-id

## Getting Help

- Check existing documentation in `/docs`
- Review code comments and JSDoc
- Check GitHub issues for known problems
- Contact the development team

## Next Steps

After setup is complete:

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Review [API.md](./API.md) for endpoint details
3. Review [DATA_MODEL.md](./DATA_MODEL.md) for database schema
4. Review [AI_FLOW.md](./AI_FLOW.md) for AI conversation logic
5. Start exploring the codebase!
