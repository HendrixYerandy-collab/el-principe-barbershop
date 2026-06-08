// ══════════════════════════════
//  routes/auth.js — Login y Registro
//  El Príncipe Barbershop
// ══════════════════════════════
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

// ── REGISTRO ─────────────────────────────────
// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  const { nombre, apellido, telefono, email, password } = req.body;

  if (!nombre || !telefono || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Completa todos los campos obligatorios.' });
  }

  // Validar email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: 'Correo electrónico inválido.' });
  }

  // Contraseña mínimo 6 caracteres
  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el email ya existe
    const existe = await pool.request()
      .input('email', sql.VarChar(150), email.toLowerCase().trim())
      .query('SELECT * FROM Usuarios WHERE email = @email');
    if (existe.recordset.length > 0) {
      return res.status(400).json({ ok: false, error: 'Este correo ya está registrado.' });
    }

    // Encriptar contraseña
    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const result = await pool.request()
      .input('nombre',       sql.VarChar(100), nombre.trim())
      .input('apellido',     sql.VarChar(100), (apellido || '').trim())
      .input('telefono',     sql.VarChar(20),  telefono.trim())
      .input('email',        sql.VarChar(150), email.toLowerCase().trim())
      .input('passwordHash', sql.VarChar(255), passwordHash)
      .query(`
  INSERT INTO Usuarios (nombre, apellido, telefono, email, password_hash, es_admin, fecha_registro)
  VALUES (@nombre, @apellido, @telefono, @email, @passwordHash, 0, GETDATE());
  SELECT SCOPE_IDENTITY() AS id_usuario;
`);

    const id_usuario = result.recordset[0].id_usuario;

    // Generar token JWT
    const token = jwt.sign(
      { id_usuario, email: email.toLowerCase().trim(), nombre: nombre.trim(), es_admin: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id_usuario,
        nombre:   nombre.trim(),
        apellido: (apellido || '').trim(),
        telefono: telefono.trim(),
        email:    email.toLowerCase().trim(),
        es_admin: false,
        citas:    []
      }
    });

  } catch (err) {
  console.error('Error en registro completo:', err);

  res.status(500).json({
    ok: false,
    error: err.message
  });
}
});

// ── LOGIN ─────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Completa todos los campos.' });
  }

  try {
    const pool = await poolPromise;

    // Buscar usuario por email
    const result = await pool.request()
      .input('email', sql.VarChar(150), email.toLowerCase().trim())
      .query('SELECT * FROM Usuarios WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
    }

    const usuario = result.recordset[0];

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email:      usuario.email,
        nombre:     usuario.nombre,
        es_admin:   !!usuario.es_admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        apellido:   usuario.apellido || '',
        telefono:   usuario.telefono || '',
        email:      usuario.email,
        es_admin:   !!usuario.es_admin
      }
    });

} catch (err) {
  console.error('Error en login:', err);

  res.status(500).json({
    ok: false,
    error: err.message
  });
}
});

module.exports = router;