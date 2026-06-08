// ══════════════════════════════
//  server.js — Servidor principal
//  El Príncipe Barbershop API
// ══════════════════════════════
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();

// ── MIDDLEWARES ──────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir archivos estáticos del frontend (un nivel arriba)
app.use(express.static(path.join(__dirname, '..')));

// ── RUTAS ────────────────────────────────────
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/citas', require('./routes/citas'));

// ── RUTA DE PRUEBA ───────────────────────────
app.get('/api', (req, res) => {
  res.json({
    mensaje: '✂ El Príncipe Barbershop API funcionando',
    version: '2.0.0',
    rutas: {
      auth:  '/api/auth/login  |  /api/auth/registro',
      citas: '/api/citas  |  /api/citas/mis-citas  |  /api/citas/hoy  |  /api/citas/horarios/:fecha'
    }
  });
});

// ── INICIAR SERVIDOR ─────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✂  Servidor corriendo en http://localhost:${PORT}`);
});