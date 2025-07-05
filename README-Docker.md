# Docker Setup for Bassquake

This document explains how to use Docker for consistent development and CI
environments with Bassquake.

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+

### Development Environment

```bash
# Start development server
npm run docker:dev

# Or use the helper script directly
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs
```

The development server will be available at `http://localhost:5173`

## Docker Images

### Development Image (`Dockerfile`)

- Based on Node.js 20 Alpine
- Includes all development dependencies
- Optimized for live development with hot reloading
- Includes Chrome/Puppeteer for testing

### CI/CD Image (`Dockerfile.ci`)

- Multi-stage build for optimized CI/CD pipelines
- Separate stages for dependencies, build, test, and production
- Production stage uses Nginx for serving static files
- Includes security scanning and optimization

## Available Commands

### Using npm scripts:

```bash
npm run docker:dev      # Start development environment
npm run docker:build    # Build development container
npm run docker:test     # Run test suite
npm run docker:ci       # Run full CI pipeline
npm run docker:cleanup  # Clean up Docker resources
```

### Using the helper script:

```bash
./scripts/docker-dev.sh <command>

Commands:
  build       Build development container
  start|dev   Start development server
  stop        Stop development server
  restart     Restart development server
  test        Run test suite
  lint        Run linter
  typecheck   Run TypeScript type checking
  build-prod  Build production bundle
  preview     Build and start preview server
  logs        Show development server logs
  shell       Start interactive shell
  cleanup     Clean up Docker resources
  ci          Run full CI pipeline locally
```

## Docker Compose Services

### bassquake-dev

Development environment with hot reloading

- Port: 5173
- Volume mounts for live code changes
- Node.js development mode

### bassquake-test

Testing environment

- Runs test suite with coverage
- Isolated environment for consistent testing
- Includes Chrome for browser-based tests

### bassquake-build

Production build environment

- Builds optimized production bundle
- Outputs to shared volume for preview

### bassquake-preview

Production preview server

- Port: 4173
- Serves production build
- Simulates production environment

## VS Code Dev Container

The project includes a dev container configuration for VS Code:

1. Install the "Remote - Containers" extension
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted
4. VS Code will build and start the dev container automatically

The dev container includes:

- Pre-configured VS Code extensions
- Automatic port forwarding
- Docker-in-Docker support
- Git integration

## Environment Variables

### Development

```bash
NODE_ENV=development
VITE_APP_ENV=development
```

### Testing

```bash
NODE_ENV=test
CI=true
```

### Production

```bash
NODE_ENV=production
```

## Health Checks

The project includes a comprehensive health check system:

```bash
# Run health check manually
npm run healthcheck

# Health check is also available in containers
docker exec <container_name> npm run healthcheck
```

Health checks monitor:

- HTTP server responsiveness
- Node.js process status
- Memory usage
- Application-specific metrics

## CI/CD Integration

### GitHub Actions

The project includes a complete CI/CD pipeline (`.github/workflows/ci.yml`):

1. **Test Stage**: Runs linting, type checking, and tests
2. **Build Stage**: Creates production Docker image
3. **Security Stage**: Vulnerability scanning with Trivy
4. **Deploy Stage**: Automated deployment to staging/production

### Local CI Testing

```bash
# Run the same checks as CI locally
./scripts/docker-dev.sh ci
```

## Production Deployment

### Using Docker

```bash
# Build production image
docker build -f Dockerfile.ci -t bassquake:production .

# Run production container
docker run -p 80:80 bassquake:production
```

### Using Docker Compose

```bash
# Build and start production preview
docker-compose up bassquake-preview
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Stop all containers
   docker-compose down

   # Check for running containers
   docker ps
   ```

2. **Container won't start**

   ```bash
   # Check logs
   docker-compose logs bassquake-dev

   # Rebuild container
   docker-compose build --no-cache bassquake-dev
   ```

3. **File permission issues**

   ```bash
   # Fix ownership (Linux/macOS)
   sudo chown -R $USER:$USER .
   ```

4. **Out of disk space**

   ```bash
   # Clean up Docker resources
   ./scripts/docker-dev.sh cleanup

   # Remove all unused containers, networks, images
   docker system prune -a
   ```

### Performance Optimization

1. **Use .dockerignore**: Ensure `.dockerignore` is properly configured
2. **Layer caching**: Dependencies are installed before copying source code
3. **Multi-stage builds**: CI image uses multi-stage builds for optimization
4. **Volume mounts**: Development uses bind mounts for live reloading

### Security Considerations

1. **Non-root user**: Containers run as non-root user (`nextjs`)
2. **Vulnerability scanning**: Trivy scans for security vulnerabilities
3. **Minimal base images**: Uses Alpine Linux for smaller attack surface
4. **Security headers**: Nginx includes security headers in production

## Best Practices

1. **Always use specific image tags** in production
2. **Keep containers stateless** - store data in volumes or external services
3. **Use multi-stage builds** for production images
4. **Regularly update base images** for security patches
5. **Monitor resource usage** with health checks
6. **Use secrets management** for sensitive data

## Support

For Docker-related issues:

1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs`
3. Ensure Docker Desktop is running and up-to-date
4. Check available disk space and memory
