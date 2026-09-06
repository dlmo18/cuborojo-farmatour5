/**
 * PM2 Ecosystem Configuration
 * Farmatour5 UAT Environment
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 logs
 */

module.exports = {
  apps: [
    {
      // ════════════════════════════════════════════════════════════
      // BACKEND API - farmatour5-backend
      // Port: 3011 (proxied via Nginx to farmatour5-api.cuborojo.pe)
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-backend',
      script: '/var/www/farmatour5/backend/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3011,
      },
      
      // Logging
      error_file: '/var/www/farmatour5/logs/backend-error.log',
      out_file: '/var/www/farmatour5/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Ignore patterns
      ignore_watch: [
        'node_modules',
        'dist',
        '*.log',
        'logs',
      ],
    },

    {
      // ════════════════════════════════════════════════════════════
      // FRONTEND ADMIN - farmatour5-manager
      // Port: 3012 (proxied via Nginx to farmatour5-admin.cuborojo.pe)
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-manager',
      script: 'npm',
      args: 'start -- -p 3012',
      cwd: '/var/www/farmatour5/frontend-manager',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3012,
      },
      
      // Logging
      error_file: '/var/www/farmatour5/logs/manager-error.log',
      out_file: '/var/www/farmatour5/logs/manager-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Ignore patterns
      ignore_watch: [
        'node_modules',
        '.next',
        '*.log',
        'logs',
      ],
    },

    {
      // ════════════════════════════════════════════════════════════
      // FRONTEND PARTICIPANTS - farmatour5-participants
      // Port: 3010 (proxied via Nginx to farmatour5.cuborojo.pe)
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-participants',
      script: 'npm',
      args: 'start -- -p 3010',
      cwd: '/var/www/farmatour5/frontend-participants',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3010,
      },
      
      // Logging
      error_file: '/var/www/farmatour5/logs/participants-error.log',
      out_file: '/var/www/farmatour5/logs/participants-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Ignore patterns
      ignore_watch: [
        'node_modules',
        '.next',
        '*.log',
        'logs',
      ],
    },
  ],

  // Deploy configuration
  deploy: {
    production: {
      user: 'deploy-uat',
      host: '35.225.15.165',
      ref: 'origin/main',
      repo: 'git@github.com:dlmo18/cuborojo-farmatour5.git',
      path: '/var/www/farmatour5',
      
      // Pre-deploy commands
      'pre-deploy-local': 'echo "Deploying to production..."',
      
      // Post-deploy commands
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
