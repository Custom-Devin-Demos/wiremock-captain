# WireMock Integration Testing Setup

This guide explains how to set up WireMock integration testing infrastructure on your machine.

## Prerequisites

- Docker installed and running
- Node.js and npm installed
- Git repository cloned

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run integration tests with automatic WireMock lifecycle
npm run integration-test
```

This automatically:
1. Downloads WireMock webhook extension
2. Starts WireMock container
3. Waits for health check
4. Runs integration tests
5. Stops WireMock container

### Option 2: Docker Compose

```bash
# Start WireMock with Docker Compose
npm run wiremock:compose:up

# Run tests
npm run test:integration

# Stop WireMock
npm run wiremock:compose:down

# Or run everything in one command
npm run wiremock:compose:test
```

### Option 3: Manual Setup

```bash
# Start WireMock manually
npm run wiremock:start

# Run tests in another terminal
npm run integration-test

# Stop WireMock when done
npm run wiremock:stop
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run integration-test` | Run integration tests with automatic WireMock lifecycle |
| `npm run wiremock:start` | Start WireMock container manually |
| `npm run wiremock:stop` | Stop WireMock container |
| `npm run wiremock:compose:up` | Start WireMock using Docker Compose |
| `npm run wiremock:compose:down` | Stop WireMock using Docker Compose |
| `npm run wiremock:compose:test` | Full test cycle with Docker Compose |

## Makefile Targets

```bash
make integration-test          # Run integration tests with shell scripts
make integration-test-compose  # Run integration tests with Docker Compose
make start-dependencies        # Start WireMock only
make stop-dependencies         # Stop WireMock only
make health-check             # Check if WireMock is running
```

## Troubleshooting

### WireMock Container Issues

```bash
# Check if container is running
docker ps --filter "name=wiremock-container"

# View container logs
docker logs wiremock-container

# Force stop and restart
docker stop wiremock-container
npm run wiremock:start
```

### Port Conflicts

If port 8080 is in use:

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process or change WireMock port in docker-compose.yml
```

### Health Check Failures

```bash
# Manual health check
curl http://localhost:8080/__admin/health

# Check WireMock admin interface
curl http://localhost:8080/__admin/mappings
```

## Test Patterns

### Using Test Helper

```typescript
import { WireMockTestHelper } from '../fixtures/wiremock-helpers';

describe('My Integration Tests', () => {
    const helper = new WireMockTestHelper();

    beforeEach(async () => {
        await helper.setupTest();
    });

    afterEach(async () => {
        await helper.verifyNoUnmatchedRequests();
    });

    afterAll(async () => {
        await helper.teardownTest();
    });
});
```

## Default Machine Setup

To set up integration testing by default on a new machine:

1. Clone the repository
2. Run `npm install`
3. Run `npm run integration-test` - everything will be set up automatically

The first run will:
- Download the WireMock webhook extension
- Pull the WireMock Docker image
- Start the container and run health checks
- Execute all integration tests
- Clean up automatically

Subsequent runs will reuse the downloaded extension and Docker image for faster startup.
