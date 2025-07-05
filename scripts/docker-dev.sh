#!/bin/bash

# Docker development helper script for Bassquake

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Build development container
build_dev() {
    print_section "Building Development Container"
    docker-compose build bassquake-dev
    print_status "Development container built successfully"
}

# Start development environment
start_dev() {
    print_section "Starting Development Environment"
    docker-compose up -d bassquake-dev
    print_status "Development server started at http://localhost:5173"
}

# Stop development environment
stop_dev() {
    print_section "Stopping Development Environment"
    docker-compose down
    print_status "Development environment stopped"
}

# Run tests
run_tests() {
    print_section "Running Tests"
    docker-compose run --rm bassquake-test
}

# Run linting
run_lint() {
    print_section "Running Linter"
    docker-compose run --rm bassquake-dev npm run lint
}

# Run type checking
run_typecheck() {
    print_section "Running Type Check"
    docker-compose run --rm bassquake-dev npm run type-check
}

# Build production
build_prod() {
    print_section "Building Production"
    docker-compose run --rm bassquake-build
    print_status "Production build completed"
}

# Start preview server
start_preview() {
    print_section "Starting Preview Server"
    docker-compose up -d bassquake-preview
    print_status "Preview server started at http://localhost:4173"
}

# Clean up Docker resources
cleanup() {
    print_section "Cleaning Up Docker Resources"
    docker-compose down -v
    docker system prune -f
    print_status "Docker cleanup completed"
}

# Show logs
show_logs() {
    docker-compose logs -f bassquake-dev
}

# Interactive shell
shell() {
    print_section "Starting Interactive Shell"
    docker-compose run --rm bassquake-dev sh
}

# Main script logic
case "$1" in
    "build")
        check_docker
        build_dev
        ;;
    "start" | "dev")
        check_docker
        start_dev
        ;;
    "stop")
        check_docker
        stop_dev
        ;;
    "restart")
        check_docker
        stop_dev
        start_dev
        ;;
    "test")
        check_docker
        run_tests
        ;;
    "lint")
        check_docker
        run_lint
        ;;
    "typecheck")
        check_docker
        run_typecheck
        ;;
    "build-prod")
        check_docker
        build_prod
        ;;
    "preview")
        check_docker
        build_prod
        start_preview
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        check_docker
        shell
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "ci")
        check_docker
        print_section "Running Full CI Pipeline"
        run_lint
        run_typecheck
        run_tests
        build_prod
        print_status "CI pipeline completed successfully"
        ;;
    *)
        echo "Bassquake Docker Development Helper"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  build       Build development container"
        echo "  start|dev   Start development server"
        echo "  stop        Stop development server"
        echo "  restart     Restart development server"
        echo "  test        Run test suite"
        echo "  lint        Run linter"
        echo "  typecheck   Run TypeScript type checking"
        echo "  build-prod  Build production bundle"
        echo "  preview     Build and start preview server"
        echo "  logs        Show development server logs"
        echo "  shell       Start interactive shell"
        echo "  cleanup     Clean up Docker resources"
        echo "  ci          Run full CI pipeline locally"
        echo ""
        echo "Examples:"
        echo "  $0 start    # Start development server"
        echo "  $0 test     # Run tests"
        echo "  $0 ci       # Run full CI pipeline"
        ;;
esac