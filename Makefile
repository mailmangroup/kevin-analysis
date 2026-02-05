.PHONY: help install dev build lint clean

# Default target
help:
	@echo "Kevin Analysis - Performance Monitoring Dashboard"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Run development server"
	@echo "  make build      - Build for production"
	@echo "  make lint       - Run ESLint"
	@echo "  make clean      - Remove build artifacts and dependencies"
	@echo ""

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Run linter
lint:
	npm run lint

# Clean build artifacts and node_modules
clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf out
