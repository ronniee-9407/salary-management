#!/bin/bash
set -e

echo "=========================================================="
echo "   ACME Corp Salary Management - AWS EC2 Auto Deployer   "
echo "=========================================================="

# 1. System Updates & Dependencies
echo "[1/6] Updating system packages & installing Python, Node.js, Nginx..."
sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv nginx git curl

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 2. Setup Project Location
APP_DIR="/var/www/salary-management"
echo "[2/6] Configuring application path at $APP_DIR..."

if [ "$(pwd)" != "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    cp -r . $APP_DIR/
    cd $APP_DIR
fi

# 3. Setup Python Virtual Environment & Backend
echo "[3/6] Setting up Python Virtual Environment & installing backend dependencies..."
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Seed 10,000 employees DB if database doesn't exist
if [ ! -f "$APP_DIR/backend/salary.db" ]; then
    echo "Seeding 10,000 employee database..."
    python app/seed.py
fi

# 4. Build Frontend Assets
echo "[4/6] Installing Node dependencies and building React frontend..."
cd $APP_DIR/frontend
npm install
npm run build

# 5. Setup Systemd Service for FastAPI
echo "[5/6] Configuring systemd service for FastAPI..."
sudo cp $APP_DIR/deploy/salary-management.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable salary-management
sudo systemctl restart salary-management

# 6. Configure Nginx
echo "[6/6] Configuring Nginx reverse proxy..."
sudo cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/salary-management
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/salary-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "=========================================================="
echo "   ✅ DEPLOYMENT SUCCESSFUL!"
echo "   Access HR Dashboard at: http://$(curl -s http://checkip.amazonaws.com)"
echo "   API Swagger Docs at:   http://$(curl -s http://checkip.amazonaws.com)/docs"
echo "=========================================================="
