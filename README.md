# auth-rbac-app

## Objective

Create a secure JWT-based authentication system with  role-based access control (RBAC)

## Installation

```bash
npm install
```

## Running db

```bash
# Ensure you have setup your env variables before continuing. Copy the contents of .env.example file

# Run a local DB instance via docker
npm run dev:up

# Stop and Close local DB instance via docker
npm run dev:down

# Run a local DB instances via docker
npm run dev:up

# Reset local DB contents
npm run db:reset
```

## Running the app server

```bash
# Ensure node version running is 16 and above

# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Running the client

```bash
# this runs the client on a liveserver connection in order to establish a websocket connection to the server
npx live-server .
```