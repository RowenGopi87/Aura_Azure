#!/bin/bash
# Bash script for Docker debugging utilities (Linux/macOS)
# Usage: ./scripts/debug-docker.sh [command] [service] [options]

set -e

COMPOSE_FILE="deployment/local/docker-compose.debug.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${CYAN}🐳 Aura Docker Debug Utilities${NC}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  start [service]    - Start debug containers (default: all)"
    echo "  stop [service]     - Stop debug containers (default: all)"
    echo "  logs [service]     - View container logs (default: all)"
    echo "  shell [service]    - Open shell in container"
    echo "  status            - Show container status"
    echo "  clean             - Clean up containers and volumes"
    echo ""
    echo -e "${YELLOW}Services:${NC}"
    echo "  application       - Next.js application container"
    echo "  database         - MariaDB database container"
    echo "  mcp              - MCP services container"
    echo "  all              - All services (default)"
    echo ""
    echo -e "${YELLOW}Log Options:${NC}"
    echo "  -f, --follow     - Follow log output"
    echo "  -t, --tail N     - Show last N lines"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./scripts/debug-docker.sh start"
    echo "  ./scripts/debug-docker.sh logs application --follow"
    echo "  ./scripts/debug-docker.sh shell application"
    echo "  ./scripts/debug-docker.sh logs mcp --tail 50"
    echo ""
    echo -e "${MAGENTA}🌐 Web Interfaces:${NC}"
    echo -e "  ${WHITE}Application:      http://localhost:3000${NC}"
    echo -e "  ${WHITE}Log Viewer:       http://localhost:9999${NC}"
    echo -e "  ${WHITE}Node Debugger:    chrome://inspect (localhost:9229)${NC}"
}

get_service_name() {
    case $1 in
        "application") echo "aura-application-debug" ;;
        "database") echo "aura-database-debug" ;;
        "mcp") echo "aura-mcp-services-debug" ;;
        "all") echo "" ;;
        *) echo "" ;;
    esac
}

start_services() {
    local service=$1
    echo -e "${GREEN}🚀 Starting debug containers...${NC}"
    
    if [[ "$service" == "all" || -z "$service" ]]; then
        docker-compose -f $COMPOSE_FILE up -d --build
    else
        local service_name=$(get_service_name $service)
        docker-compose -f $COMPOSE_FILE up -d --build $service_name
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Containers started successfully!${NC}"
        echo ""
        show_web_interfaces
    else
        echo -e "${RED}❌ Failed to start containers${NC}"
        exit 1
    fi
}

stop_services() {
    local service=$1
    echo -e "${YELLOW}🛑 Stopping debug containers...${NC}"
    
    if [[ "$service" == "all" || -z "$service" ]]; then
        docker-compose -f $COMPOSE_FILE down
    else
        local service_name=$(get_service_name $service)
        docker-compose -f $COMPOSE_FILE stop $service_name
    fi
    
    echo -e "${GREEN}✅ Containers stopped${NC}"
}

show_logs() {
    local service=$1
    shift
    local log_args=()
    
    # Parse log options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                log_args+=("-f")
                shift
                ;;
            -t|--tail)
                log_args+=("--tail" "$2")
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    if [[ "$service" == "all" || -z "$service" ]]; then
        echo -e "${CYAN}📋 Showing logs for all services...${NC}"
        docker-compose -f $COMPOSE_FILE logs "${log_args[@]}"
    else
        local service_name=$(get_service_name $service)
        echo -e "${CYAN}📋 Showing logs for $service...${NC}"
        docker-compose -f $COMPOSE_FILE logs "${log_args[@]}" $service_name
    fi
}

open_shell() {
    local service=$1
    
    if [[ "$service" == "all" || -z "$service" ]]; then
        echo -e "${RED}❌ Please specify a specific service for shell access${NC}"
        return 1
    fi
    
    local service_name=$(get_service_name $service)
    echo -e "${CYAN}🐚 Opening shell in $service_name...${NC}"
    
    # Try to use bash first, then sh
    docker exec -it $service_name /bin/bash 2>/dev/null || docker exec -it $service_name /bin/sh
}

show_status() {
    echo -e "${CYAN}📊 Container Status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${CYAN}🔍 Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

clean_environment() {
    echo -e "${YELLOW}🧹 Cleaning up debug environment...${NC}"
    
    # Stop and remove containers
    docker-compose -f $COMPOSE_FILE down -v --remove-orphans
    
    # Remove debug images
    docker image prune -f --filter label=aura-debug 2>/dev/null || true
    
    echo -e "${GREEN}✅ Environment cleaned up${NC}"
}

show_web_interfaces() {
    echo -e "${MAGENTA}🌐 Available Web Interfaces:${NC}"
    echo -e "  ${WHITE}📱 Application:      http://localhost:3000${NC}"
    echo -e "  ${WHITE}📋 Log Viewer:       http://localhost:9999${NC}"
    echo -e "  ${WHITE}🔍 Node Debugger:    chrome://inspect (localhost:9229)${NC}"
    echo ""
}

# Main execution
case ${1:-help} in
    "start")
        start_services ${2:-all}
        ;;
    "stop")
        stop_services ${2:-all}
        ;;
    "logs")
        show_logs ${2:-all} "${@:3}"
        ;;
    "shell")
        open_shell ${2}
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_environment
        ;;
    "help"|*)
        show_help
        ;;
esac







