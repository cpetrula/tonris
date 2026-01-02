# TONRIS Deployment Guide

This guide covers deploying TONRIS to production environments.

## Deployment Overview

TONRIS consists of:
- **Backend**: Node.js/Express API server
- **Frontend**: Vue 3 SPA (static files served by backend)
- **Database**: MySQL 8.0+
- **External Services**: Stripe, Twilio, OpenAI, ElevenLabs

## Prerequisites

- Server with Node.js 18+ installed
- MySQL 8.0+ database
- Domain name with SSL certificate
- External service accounts configured

## Environment Configuration

### Production Environment Variables

Create a `.env` file on your production server with all required variables:

```env
# ===========================================
# Server Configuration
# ===========================================
NODE_ENV=production
PORT=3000

# ===========================================
# Database Configuration
# ===========================================
DB_HOST=your-db-host.com
DB_PORT=3306
DB_NAME=tonris_production
DB_USER=tonris_user
DB_PASSWORD=<secure-password>

# ===========================================
# Logging
# ===========================================
LOG_LEVEL=info

# ===========================================
# Multi-Tenant
# ===========================================
DEFAULT_TENANT_ID=default

# ===========================================
# JWT Configuration (use secure random strings!)
# ===========================================
# Generate with: openssl rand -base64 64
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# Stripe Configuration
# ===========================================
# Use LIVE keys for production (sk_live_xxx, pk_live_xxx)
# Monthly price: $295.00
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# ===========================================
# Twilio Configuration
# ===========================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
APP_BASE_URL=https://api.yourdomain.com

# ===========================================
# ElevenLabs Configuration
# ===========================================
ELEVENLABS_API_KEY=your_elevenlabs_api_key
# DEPRECATED: ELEVENLABS_AGENT_ID - Agent ID is now configured per business type in the database
# ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id  # Only for backward compatibility
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id

# ===========================================
# OpenAI Configuration
# ===========================================
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
```

### Security Checklist

- [ ] JWT_SECRET is a secure random string (64+ characters)
- [ ] Database password is strong and unique
- [ ] All API keys are production keys (not test/sandbox)
- [ ] `.env` file has restricted permissions (`chmod 600 .env`)
- [ ] `.env` is excluded from version control

## Deployment Options

### Option 1: Traditional VPS Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y
```

#### 2. Database Setup

```bash
# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE tonris_production;
CREATE USER 'tonris_user'@'localhost' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON tonris_production.* TO 'tonris_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/tonris
sudo chown $USER:$USER /var/www/tonris

# Clone repository
cd /var/www/tonris
git clone https://github.com/your-org/tonris.git .

# Install backend dependencies
cd backend
npm ci --production

# Build frontend
cd ../frontend
npm ci
npm run build

# The built files in frontend/dist will be served by the backend
```

#### 4. Create Environment File

```bash
# Create .env file
cd /var/www/tonris/backend
nano .env
# Paste your production environment variables

# Secure the file
chmod 600 .env
```

#### 5. PM2 Configuration

Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [{
    name: 'tonris-backend',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/tonris/error.log',
    out_file: '/var/log/tonris/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '500M'
  }]
};
```

#### 6. Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/tonris
sudo chown $USER:$USER /var/log/tonris

# Start with PM2
cd /var/www/tonris/backend
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp /home/$USER
```

#### 7. Nginx Configuration

Create `/etc/nginx/sites-available/tonris`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tonris /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Docker Deployment

#### Dockerfile (Backend)

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

# Start application
CMD ["node", "src/app.js"]
```

#### docker-compose.yml

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - tonris-network

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: tonris_production
      MYSQL_USER: tonris_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - tonris-network

volumes:
  mysql-data:

networks:
  tonris-network:
    driver: bridge
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

### Option 3: Platform-as-a-Service (Heroku, Railway, Render)

#### Heroku Deployment

1. Create a `Procfile` in backend:
```
web: node src/app.js
```

2. Deploy:
```bash
# Login to Heroku
heroku login

# Create app
heroku create tonris-api

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... set all other variables

# Deploy
git push heroku main
```

## Database Management

### Migrations

For production, use Sequelize migrations instead of sync:

```bash
# Generate migration
npx sequelize-cli migration:generate --name create-users

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

### Backups

Set up automated backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
mysqldump -u tonris_user -p'password' tonris_production > /backups/tonris_$DATE.sql
gzip /backups/tonris_$DATE.sql

# Keep only last 30 days
find /backups -name "tonris_*.sql.gz" -mtime +30 -delete
```

Add to cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## External Service Configuration

### Stripe Webhooks

Configure production webhooks in Stripe Dashboard:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Configure the endpoint:
   - **Endpoint URL**: `https://api.yourdomain.com/api/webhooks/stripe`
   - **Description**: "TONRIS Production Webhooks"
   - **API Version**: Latest (2023-10-16 or newer)

4. Select the following webhook events to send:
   - `checkout.session.completed` - When customer completes checkout
   - `customer.subscription.created` - When subscription is created
   - `customer.subscription.updated` - When subscription status changes
   - `customer.subscription.deleted` - When subscription is cancelled
   - `invoice.paid` - When invoice payment succeeds
   - `invoice.payment_failed` - When invoice payment fails

5. After creating the endpoint:
   - Click on the webhook endpoint
   - Click "Reveal" under "Signing secret"
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add to your production `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
     ```

6. Test the webhook:
   - Click "Send test webhook" in Stripe Dashboard
   - Select event type: `customer.subscription.created`
   - Verify the webhook is received successfully
   - Check your application logs for: `Processing webhook event: customer.subscription.created`

7. Monitor webhook delivery:
   - View webhook attempts in Stripe Dashboard
   - Set up alerts for failed webhook deliveries
   - Webhooks will retry automatically on failure

**Important Notes:**
- The webhook endpoint must be publicly accessible
- Use HTTPS in production (required by Stripe)
- The endpoint processes raw request body for signature verification
- Rate limiting: 100 requests per minute per IP

For complete Stripe integration details, see [STRIPE.md](../STRIPE.md)

### Twilio Webhooks

1. Go to Twilio Console → Phone Numbers → Active Numbers
2. Select your number
3. Configure webhooks:
   - Voice webhook: `https://api.yourdomain.com/api/webhooks/twilio/voice` (HTTP POST)
   - Messaging webhook: `https://api.yourdomain.com/api/webhooks/twilio/sms` (HTTP POST)
   - Status callback: `https://api.yourdomain.com/api/webhooks/twilio/status`

## Monitoring

### Health Checks

Configure monitoring to check:
- `https://api.yourdomain.com/health` - Basic health
- `https://api.yourdomain.com/health/ready` - Database connectivity
- `https://api.yourdomain.com/health/live` - Process alive

### Application Monitoring

Consider using:
- **PM2 Metrics**: `pm2 monit`
- **New Relic** or **Datadog** for APM
- **Sentry** for error tracking

### Log Management

```bash
# View PM2 logs
pm2 logs tonris-backend

# Rotate logs
pm2 install pm2-logrotate
```

## Scaling

### Horizontal Scaling

1. Run multiple backend instances:
```javascript
// ecosystem.config.js
instances: 'max', // or specific number like 4
```

2. Use load balancer (Nginx or cloud provider)

### Database Scaling

1. Use read replicas for read-heavy operations
2. Configure connection pooling in Sequelize
3. Consider managed database services (AWS RDS, GCP Cloud SQL)

## Security Hardening

### Server Security

```bash
# Firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Fail2ban
sudo apt install fail2ban
```

### Application Security

- Keep dependencies updated: `npm audit fix`
- Use HTTPS everywhere
- Implement rate limiting (already in place)
- Regular security audits

## Maintenance

### Updates

```bash
# Pull latest code
cd /var/www/tonris
git pull origin main

# Install dependencies
cd backend
npm ci --production

# Build frontend
cd ../frontend
npm ci
npm run build

# Restart application
cd ../backend
pm2 reload tonris-backend
```

### Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or checkout specific version
git checkout v1.0.0

# Reinstall and restart
npm ci --production
pm2 reload tonris-backend
```

## Troubleshooting

### Application Won't Start

1. Check logs: `pm2 logs tonris-backend`
2. Verify environment variables
3. Test database connection
4. Check port availability

### Database Connection Issues

1. Verify credentials
2. Check firewall rules
3. Verify MySQL is running
4. Check connection limit

### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### High Memory Usage

1. Check PM2 status: `pm2 status`
2. Restart if needed: `pm2 restart tonris-backend`
3. Adjust `max_memory_restart` in ecosystem.config.js

## Support

For deployment issues:
1. Check application logs
2. Review this documentation
3. Search GitHub issues
4. Contact the development team
