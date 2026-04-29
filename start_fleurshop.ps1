# --- FLEURSHOP MULTI-TERMINAL STARTER ---

# 1. Start Consul (The Registry)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "consul agent -dev -ui -client=0.0.0.0" -NoNewWindow
Write-Host "🚀 Consul starting..." -ForegroundColor Cyan

# 2. Start Traefik (The Gateway)
# Assumes you are in the fleurshop folder; adjust path if needed
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd traefik; .\traefik --configFile=traefik.yml"
Write-Host "🛣️  Traefik starting..." -ForegroundColor Yellow

# 3. Start Auth Service (Port 8001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd auth-service; .\venv\Scripts\activate; python manage.py runserver 8001"
Write-Host "🔑 Auth Service starting..." -ForegroundColor Green

# 4. Start API Service (Port 8002)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-service; .\venv\Scripts\activate; python manage.py runserver 8002"
Write-Host "🌸 API Service starting..." -ForegroundColor Magenta

# 5. Start Worker (Consumer)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-service; .\venv\Scripts\activate; python consumer.py"
Write-Host "👷 Worker starting..." -ForegroundColor Blue

# 6. Start Frontend (React)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Write-Host "💻 Frontend starting..." -ForegroundColor White

Write-Host "`n✨ All 6 services have been triggered!" -ForegroundColor Green -BackgroundColor Black