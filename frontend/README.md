# TONRIS Frontend

Vue 3 frontend application for TONRIS AI Assistant platform.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **PrimeVue** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication

## Project Structure

```
frontend/
├── src/
│   ├── main.ts           # Application entry point
│   ├── App.vue           # Root component
│   ├── router/
│   │   └── index.ts      # Vue Router configuration
│   ├── stores/
│   │   ├── auth.ts       # Authentication state
│   │   └── tenant.ts     # Tenant/workspace state
│   ├── components/       # Reusable components
│   ├── layouts/
│   │   ├── PublicLayout.vue      # Layout for public pages
│   │   └── DashboardLayout.vue   # Layout for authenticated pages
│   ├── services/
│   │   └── api.ts        # Axios API client with JWT handling
│   └── pages/            # Page components
├── public/               # Static assets
├── package.json
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- **Authentication**: JWT-based authentication with automatic token handling
- **Route Guards**: Protected routes for authenticated users
- **Multi-tenant Support**: Workspace/tenant state management
- **Responsive Design**: Mobile-first, responsive layouts
- **PrimeVue Components**: Enterprise-grade UI components
- **Tailwind CSS**: Utility-first styling

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

## API Integration

The API client (`src/services/api.ts`) automatically:
- Adds JWT tokens to authenticated requests
- Handles token expiration and redirects to login
- Proxies API requests to the backend in development

## Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication)
- `/app` - Dashboard
- `/app/*` - Authenticated app routes

## License

ISC
