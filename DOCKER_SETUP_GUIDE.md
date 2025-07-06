# Docker Setup Guide for LocalAI

## Install Docker Desktop for Windows

1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"

2. **Install Docker Desktop:**
   - Run the installer as Administrator
   - Follow the installation wizard
   - Enable WSL 2 integration when prompted
   - Restart your computer after installation

3. **Start Docker Desktop:**
   - Launch Docker Desktop from Start menu
   - Wait for it to fully start (Docker whale icon should be stable in system tray)

4. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

## Start LocalAI

Once Docker is installed, run these commands in your project directory:

```bash
# Start LocalAI services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f localai
```

## Access LocalAI

- **API Endpoint:** http://localhost:8080
- **Web UI:** http://localhost:3000
- **API Documentation:** http://localhost:8080/docs

## Stop LocalAI

```bash
# Stop services
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

## Troubleshooting

1. **Port conflicts:** If ports 8080 or 3000 are busy, edit `docker-compose.yml` to use different ports
2. **Memory issues:** LocalAI requires at least 4GB RAM, 8GB recommended
3. **Model loading:** First startup may take time as models download and load

## Alternative: Use Cloud LocalAI

If you prefer not to install Docker, you can use our cloud endpoint:
- Test endpoint: `https://api.localai.io/v1/chat/completions`
- Note: Public instances may be slower or unavailable
