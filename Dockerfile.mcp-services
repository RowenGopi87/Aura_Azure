# Aura SDLC MCP Services Container
# Contains Python MCP server and Playwright automation with headless browser

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Playwright and browsers
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc-s1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for Playwright MCP
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy Python requirements and install
COPY mcp/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright and browsers
RUN npm install -g @playwright/mcp@latest
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Copy MCP server files
COPY mcp/ ./

# Create screenshots directory with proper permissions
RUN mkdir -p /app/screenshots && chmod 755 /app/screenshots

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start virtual display for headless browser\n\
Xvfb :99 -screen 0 1024x768x24 &\n\
export DISPLAY=:99\n\
\n\
# Wait for display to be ready\n\
sleep 2\n\
\n\
# Start Python MCP server in background\n\
python mcp_server.py &\n\
MCP_SERVER_PID=$!\n\
\n\
# Wait for MCP server to start\n\
sleep 3\n\
\n\
# Start Playwright MCP server\n\
npx @playwright/mcp@latest --port 8931 --browser chromium --headless --output-dir /app/screenshots &\n\
PLAYWRIGHT_PID=$!\n\
\n\
# Wait for any process to exit\n\
wait -n\n\
\n\
# Exit with status of process that exited first\n\
exit $?' > /app/start-mcp-services.sh && chmod +x /app/start-mcp-services.sh

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash mcp
RUN chown -R mcp:mcp /app
USER mcp

# Set environment variables
ENV DISPLAY=:99
ENV PLAYWRIGHT_BROWSERS_PATH=/home/mcp/.cache/ms-playwright
ENV PYTHONUNBUFFERED=1

# Expose MCP service ports
EXPOSE 8000 8931 8932

# Health check for MCP services
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start all MCP services
CMD ["/app/start-mcp-services.sh"]