/**
 * PM2 Ecosystem Configuration
 * Farmatour5 UAT / Production Environment
 *
 * La ruta base de despliegue se toma de la variable de entorno
 * DEPLOY_BASE_PATH. Si no está definida, cae al valor por defecto.
 * Esto mantiene la ruta como variable de entorno, igual que en el
 * workflow de CI/CD y en los .env de cada aplicación.
 *
 * Uso:
 *   DEPLOY_BASE_PATH=/var/www/farmatour5 pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --only farmatour5-backend
 *   pm2 reload ecosystem.config.js
 *   pm2 logs
 */

const path = require('path');

// Ruta base de despliegue (variable de entorno con fallback).
const BASE_PATH = process.env.DEPLOY_BASE_PATH || '/var/www/farmatour5';

// Puertos configurables por entorno (con fallback a los valores UAT).
const BACKEND_PORT = process.env.BACKEND_PORT || 3011;
const MANAGER_PORT = process.env.MANAGER_PORT || 3012;
const PARTICIPANTS_PORT = process.env.PARTICIPANTS_PORT || 3010;

const LOGS_PATH = path.join(BASE_PATH, 'logs');

module.exports = {
  apps: [
    {
      // ════════════════════════════════════════════════════════════
      // BACKEND API - farmatour5-backend
      // Proxied via Nginx a farmatour5-api.cuborojo.pe
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-backend',
      script: path.join(BASE_PATH, 'backend/dist/main.js'),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: BACKEND_PORT,
      },

      // Logging
      error_file: path.join(LOGS_PATH, 'backend-error.log'),
      out_file: path.join(LOGS_PATH, 'backend-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Ignore patterns
      ignore_watch: ['node_modules', 'dist', '*.log', 'logs'],
    },

    {
      // ════════════════════════════════════════════════════════════
      // FRONTEND ADMIN - farmatour5-manager
      // Proxied via Nginx a farmatour5-admin.cuborojo.pe
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-manager',
      script: 'npm',
      args: `start -- -p ${MANAGER_PORT}`,
      cwd: path.join(BASE_PATH, 'frontend-manager'),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: MANAGER_PORT,
      },

      // Logging
      error_file: path.join(LOGS_PATH, 'manager-error.log'),
      out_file: path.join(LOGS_PATH, 'manager-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Ignore patterns
      ignore_watch: ['node_modules', '.next', '*.log', 'logs'],
    },

    {
      // ════════════════════════════════════════════════════════════
      // FRONTEND PARTICIPANTS - farmatour5-participants
      // Proxied via Nginx a farmatour5.cuborojo.pe
      // ════════════════════════════════════════════════════════════
      name: 'farmatour5-participants',
      script: 'npm',
      args: `start -- -p ${PARTICIPANTS_PORT}`,
      cwd: path.join(BASE_PATH, 'frontend-participants'),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: PARTICIPANTS_PORT,
      },

      // Logging
      error_file: path.join(LOGS_PATH, 'participants-error.log'),
      out_file: path.join(LOGS_PATH, 'participants-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Ignore patterns
      ignore_watch: ['node_modules', '.next', '*.log', 'logs'],
    },
  ],

  // Deploy configuration (pm2 deploy, opcional)
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy-uat',
      host: process.env.DEPLOY_HOST || '35.225.15.165',
      ref: 'origin/main',
      repo: 'git@github.com:dlmo18/cuborojo-farmatour5.git',
      path: BASE_PATH,

      // Pre-deploy commands
      'pre-deploy-local': 'echo "Deploying to production..."',

      // Post-deploy commands
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
