#!/bin/bash

# Development Server Management Script
# Usage: ./dev-server.sh [start|stop|restart|status|debug]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

kill_dev_processes() {
    print_status "Killing existing development processes..."
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    sleep 2
    
    if check_port 8080; then
        print_warning "Port 8080 still in use, attempting to free it..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    if ! check_port 8080; then
        print_success "Port 8080 is now available"
    else
        print_error "Port 8080 is still in use"
        lsof -i :8080
    fi
}

start_dev_server() {
    print_status "Starting development server..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Clear any existing processes
    kill_dev_processes
    
    # Start the development server
    print_status "Launching Vite development server..."
    npm run dev
}

check_server_status() {
    print_status "Checking development server status..."
    
    if check_port 8080; then
        print_success "Development server is running on port 8080"
        
        # Test if server responds
        if curl -f http://localhost:8080/ >/dev/null 2>&1; then
            print_success "Server is responding to requests"
            echo -e "${GREEN}✓${NC} http://localhost:8080/"
            
            # Show network URLs
            local ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
            if [ ! -z "$ip" ]; then
                echo -e "${GREEN}✓${NC} http://$ip:8080/ (network access)"
            fi
        else
            print_error "Server is running but not responding"
        fi
    else
        print_warning "No development server found on port 8080"
    fi
    
    # Show any Node.js processes
    local processes=$(ps aux | grep -E "(vite|npm.*dev)" | grep -v grep)
    if [ ! -z "$processes" ]; then
        print_status "Active development processes:"
        echo "$processes"
    fi
}

debug_environment() {
    print_status "Running development environment diagnostics..."
    
    echo -e "\n${BLUE}=== Node.js Environment ===${NC}"
    node --version
    npm --version
    
    echo -e "\n${BLUE}=== Port Status ===${NC}"
    for port in 8080 3000 3001; do
        if check_port $port; then
            echo -e "Port $port: ${RED}BUSY${NC}"
            lsof -i :$port
        else
            echo -e "Port $port: ${GREEN}AVAILABLE${NC}"
        fi
    done
    
    echo -e "\n${BLUE}=== Network Configuration ===${NC}"
    ifconfig | grep "inet " | grep -v 127.0.0.1
    
    echo -e "\n${BLUE}=== Project Status ===${NC}"
    if [ -f "package.json" ]; then
        echo -e "package.json: ${GREEN}✓${NC}"
    else
        echo -e "package.json: ${RED}✗${NC}"
    fi
    
    if [ -d "node_modules" ]; then
        echo -e "node_modules: ${GREEN}✓${NC}"
    else
        echo -e "node_modules: ${RED}✗${NC} (run npm install)"
    fi
    
    if [ -f "vite.config.ts" ]; then
        echo -e "vite.config.ts: ${GREEN}✓${NC}"
    else
        echo -e "vite.config.ts: ${RED}✗${NC}"
    fi
    
    echo -e "\n${BLUE}=== Suggested Commands ===${NC}"
    echo "npm run dev          - Standard development server"
    echo "npm run dev:clean    - Clean start (kills processes, clears cache)"
    echo "npm run dev:debug    - Development with debug logging"
    echo "npm run kill:dev     - Kill all development processes"
    echo "npm run test:dev     - Test if server is responding"
}

case "$1" in
    start)
        start_dev_server
        ;;
    stop)
        kill_dev_processes
        ;;
    restart)
        kill_dev_processes
        sleep 2
        start_dev_server
        ;;
    status)
        check_server_status
        ;;
    debug)
        debug_environment
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|debug}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the development server"
        echo "  stop    - Stop all development processes"
        echo "  restart - Stop and start the development server"
        echo "  status  - Check if development server is running"
        echo "  debug   - Run diagnostics and show environment info"
        exit 1
        ;;
esac