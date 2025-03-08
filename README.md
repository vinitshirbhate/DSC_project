# Hono.js Authentication Backend

A Cloudflare Workers backend built with [Hono.js](https://hono.dev/) that provides authentication endpoints, Swagger API documentation, and health check functionality. The project uses Prisma to connect to a PostgreSQL database and Upstash Redis for caching.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Features

- **Authentication:**  
  Custom in-house authentication logic with password hashing and JWT token generation.

- **Health Check:**  
  A dedicated `/health` endpoint that verifies connectivity to PostgreSQL and Redis.

- **Swagger API Docs:**  
  Interactive API documentation available at `/api/v1/docs`.

- **Caching:**  
  Uses an in-memory cache and Upstash Redis for performance improvements.

- **Cloudflare Workers:**  
  Leverages Cloudflare Workers for edge computing, with full compatibility via Wrangler.

## Project Structure

```
├── src
│ ├── controllers
│ │ └── UserController.ts # Authentication & user routes
│ ├── db
│ │ ├── prisma.ts # Prisma client initialization
│ │ └── redis.cache.ts # Redis singleton for caching
│ ├── models
│ │ └── user.model.ts # User schema & validation
│ ├── routes
│ │ ├── index.ts # API routes setup
│ │ └── swagger.ts # Swagger documentation setup
│ ├── utils
│ │ ├── generateToken.ts # JWT token generation utility
│ │ └── types.ts # Common types for caching and responses
│ └── index.ts # Main entry point for the Worker
├── tests
│ └── auth.test.ts # Vitest test cases for authentication endpoints
├── wrangler.sample.jsonc # Wrangler configuration sample
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) for Cloudflare Workers deployments
- A Cloudflare account
- PostgreSQL database credentials
- Upstash Redis credentials

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vinitshirbhate/DSC_project.git
   cd DSC_project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Environment Variables

For local development, rename a `.env.sample`-> `.env` file in the root directory:

```env
DATABASE_URL=prisma+postgres://username:password@host:port/database?sslmode=require
```

Also Rename the `wrangler.sample.jsonc`-> `wrangler.jsonc` file in the root directory and update the vars with your own values.

## Development

To run the project locally with Cloudflare Workers emulation:

```bash
npm run dev
```

This command uses your local environment variables and simulates the Cloudflare Workers environment.

## Testing

The project uses [Vitest](https://vitest.dev/) for testing.

1. **Run Tests:**

   ```bash
   npm run test
   ```

Tests cover endpoints such as user registration, login, and health checks.

## Deployment

To deploy your project to Cloudflare Workers:

1. **Build (optional):**

   If you need to build your project (e.g., if you're using TypeScript):

   ```bash
   npm run build
   ```

2. **Publish:**

   ```bash
   npx wrangler publish
   ```

Remember to use `wrangler secret put` for setting production secrets, as detailed in the [Environment Variables](#environment-variables) section.

## API Documentation

Interactive API documentation is available using Swagger. Once your project is running, navigate to [http://localhost:8787/api/v1/docs](http://localhost:8787/api/v1/docs) to explore and test the API endpoints.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write tests for your changes.
4. Submit a pull request with a detailed description.

Happy coding!
