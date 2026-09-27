# 🚀 AWS EC2 Deployment Guide

Complete step-by-step instructions to deploy the **ACME Corp Salary Management Application** on an **AWS EC2 Ubuntu 22.04 / 24.04 LTS Instance** using **Nginx**, **Uvicorn**, **Systemd**, and **SQLite**.

---

## 📋 Prerequisites
- An active **AWS Account**.
- Your Git repository URL (`https://github.com/ronniee-9407/salary-management.git`).
- SSH Client (Terminal / PowerShell / PuTTY).

---

## STEP 1: Launch an AWS EC2 Instance

1. Log into **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**.
3. **Name**: `Salary-Management-Server`
4. **AMI**: `Ubuntu Server 24.04 LTS` (or 22.04 LTS 64-bit x86).
5. **Instance Type**: `t2.micro` (Free Tier) or `t3.small` (Recommended for smooth Vite build).
6. **Key Pair**: Select your existing key pair or click **Create new key pair** (e.g. `salary-key.pem`).
7. **Network Settings (Security Group)**:
   - Check **Allow SSH traffic from** -> `My IP` (or `0.0.0.0/0`).
   - Check **Allow HTTP traffic from the internet** (`Port 80`).
   - *(Optional)* Check **Allow HTTPS traffic from the internet** (`Port 443`).
8. **Storage**: `15 GB` gp3 SSD.
9. Click **Launch Instance**.

---

## STEP 2: Connect to your EC2 Instance via SSH

Open your local terminal and connect:

```bash
# Set proper permission on key file (Linux/macOS)
chmod 400 salary-key.pem

# SSH into your EC2 instance (Replace with your instance's Public IPv4 IP)
ssh -i "salary-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

## STEP 3: Clone Repository & Run Automated Setup Script

Once inside your EC2 instance terminal:

```bash
# 1. Clone repository
git clone https://github.com/ronniee-9407/salary-management.git
cd salary-management

# 2. Grant executable permission to setup script
chmod +x deploy/ec2_setup.sh

# 3. Run automated deployment script
./deploy/ec2_setup.sh
```

---

## 🛠️ What the Automated Script Does:

1. **Updates packages**: Installs `Python 3`, `pip`, `venv`, `Node.js 20 LTS`, `Nginx`, and `git`.
2. **Builds Backend**: Creates Python venv, installs dependencies (`FastAPI`, `SQLAlchemy`, `Uvicorn`, etc.), and seeds the **10,000 employee database**.
3. **Builds Frontend**: Runs `npm install` and `npm run build` to generate static React assets in `frontend/dist`.
4. **Configures Systemd**: Creates and starts a background daemon (`salary-management.service`) listening on `http://127.0.0.1:8000`.
5. **Configures Nginx**: Replaces default Nginx site to serve React assets on **Port 80** and reverse-proxy `/api` endpoints to FastAPI.

---

## STEP 4: Manual Step-by-Step (Alternative to script)

If you prefer doing steps manually instead of using `ec2_setup.sh`:

### 1. Install System Packages
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Setup Backend & Seed Database
```bash
cd ~/salary-management/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/seed.py
```

### 3. Build Frontend
```bash
cd ~/salary-management/frontend
npm install
npm run build
```

### 4. Setup Systemd Service
```bash
sudo cp ~/salary-management/deploy/salary-management.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable salary-management
sudo systemctl start salary-management
```

### 5. Setup Nginx Reverse Proxy
```bash
sudo cp ~/salary-management/deploy/nginx.conf /etc/nginx/sites-available/salary-management
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/salary-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🌐 STEP 5: Verify Live Deployment

Open your web browser and navigate to:
- **HR Dashboard UI**: `http://<YOUR-EC2-PUBLIC-IP>`
- **FastAPI Interactive Docs**: `http://<YOUR-EC2-PUBLIC-IP>/docs`
- **Backend Health Check**: `http://<YOUR-EC2-PUBLIC-IP>/api/v1/health`

---

## 🔍 Useful Operations & Debug Commands

```bash
# View FastAPI backend logs
sudo journalctl -u salary-management -f

# View Nginx access & error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart backend service
sudo systemctl restart salary-management

# Restart Nginx
sudo systemctl restart nginx
```
