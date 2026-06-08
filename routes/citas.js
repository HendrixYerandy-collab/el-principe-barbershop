// ══════════════════════════════
//  routes/citas.js — Citas
//  El Príncipe Barbershop
// ══════════════════════════════
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { sql, poolPromise } = require('../db');

// ── MIDDLEWARE: verificar token ───────────────
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'Token requerido.' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido o expirado.' });
  }
}

// ── MIDDLEWARE: solo admin ────────────────────
function soloAdmin(req, res, next) {
  if (!req.usuario || !req.usuario.es_admin) {
    return res.status(403).json({ ok: false, error: 'Acceso denegado. Solo administradores.' });
  }
  next();
}

// ── AGENDAR CITA ──────────────────────────────
// POST /api/citas
router.post('/', async (req, res) => {
  const { nombre, apellido, telefono, id_servicio, fecha_cita, hora_cita } = req.body;

  if (!nombre || !telefono || !id_servicio || !fecha_cita || !hora_cita) {
    return res.status(400).json({ ok: false, error: 'Completa todos los campos.' });
  }

  // Validar que la fecha no sea en el pasado
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fechaReserva = new Date(fecha_cita + 'T00:00:00');
  if (fechaReserva < hoy) {
    return res.status(400).json({ ok: false, error: 'No puedes agendar en fechas pasadas.' });
  }

  try {
    const pool = await poolPromise;

    // Verificar que el servicio existe en la BD
    const svcExiste = await pool.request()
      .input('id_servicio', sql.Int, id_servicio)
      .query('SELECT id_servicio FROM Servicios WHERE id_servicio = @id_servicio');

    if (svcExiste.recordset.length === 0) {
      const svcs = await pool.request().query('SELECT id_servicio, nombre FROM Servicios ORDER BY id_servicio');
      return res.status(400).json({
        ok: false,
        error: 'Servicio #' + id_servicio + ' no encontrado. IDs en tu BD: ' + svcs.recordset.map(s => s.id_servicio+':'+s.nombre).join(', ')
      });
    }

        // Verificar que el horario no esté ocupado
    const ocupado = await pool.request()
      .input('fecha', sql.Date,    fecha_cita)
      .input('hora',  sql.VarChar(8), hora_cita)
      .query(`
        SELECT id_cita FROM Citas
        WHERE fecha_cita = @fecha
          AND hora_cita  = @hora
          AND estado     <> 'cancelada'
      `);

    if (ocupado.recordset.length > 0) {
      return res.status(409).json({ ok: false, error: 'Ese horario ya está reservado.' });
    }

    // Calcular número de turno del día
    const turnoHoy = await pool.request()
      .input('fecha', sql.Date, fecha_cita)
      .query(`
        SELECT ISNULL(MAX(numero_turno), 0) + 1 AS siguiente
        FROM Citas WHERE fecha_cita = @fecha
      `);
    const numero_turno = turnoHoy.recordset[0].siguiente;

    // Buscar cliente por teléfono + nombre
    // Si el teléfono existe pero el nombre es diferente = persona diferente = cliente nuevo
    let id_cliente;
    const clienteExiste = await pool.request()
      .input('telefono', sql.VarChar(20),  telefono)
      .input('nombre',   sql.VarChar(100), nombre)
      .query(`
        SELECT id_cliente FROM Clientes
        WHERE telefono = @telefono
          AND LOWER(LTRIM(RTRIM(nombre))) = LOWER(LTRIM(RTRIM(@nombre)))
      `);

    if (clienteExiste.recordset.length > 0) {
      // Mismo teléfono y mismo nombre = misma persona, solo actualizar apellido si cambió
      id_cliente = clienteExiste.recordset[0].id_cliente;
      await pool.request()
        .input('id_cliente', sql.Int,          id_cliente)
        .input('apellido',   sql.VarChar(100), apellido || '')
        .query(`UPDATE Clientes SET apellido = @apellido WHERE id_cliente = @id_cliente`);
    } else {
      // Teléfono nuevo O mismo teléfono con nombre diferente = cliente nuevo
      const nuevoCliente = await pool.request()
        .input('nombre',   sql.VarChar(100), nombre)
        .input('apellido', sql.VarChar(100), apellido || '')
        .input('telefono', sql.VarChar(20),  telefono)
        .query(`
          INSERT INTO Clientes (nombre, apellido, telefono)
          VALUES (@nombre, @apellido, @telefono);
          SELECT SCOPE_IDENTITY() AS id_cliente;
        `);
      id_cliente = nuevoCliente.recordset[0].id_cliente;
    }

    // Insertar cita
    await pool.request()
      .input('id_cliente',    sql.Int,      id_cliente)
      .input('id_servicio',   sql.Int,      id_servicio)
      .input('fecha_cita',    sql.Date,     fecha_cita)
      .input('hora_cita',     sql.VarChar(8), hora_cita)
      .input('numero_turno',  sql.Int,      numero_turno)
      .query(`
        INSERT INTO Citas (id_cliente, id_servicio, fecha_cita, hora_cita, numero_turno, estado, fecha_creacion)
        VALUES (@id_cliente, @id_servicio, @fecha_cita, @hora_cita, @numero_turno, 'pendiente', GETDATE())
      `);

    res.json({ ok: true, numero_turno });

  } catch (err) {
    console.error('Error al agendar cita:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// ── HORARIOS OCUPADOS POR FECHA ───────────────
// GET /api/citas/horarios/:fecha
router.get('/horarios/:fecha', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('fecha', sql.Date, req.params.fecha)
      .query(`
        SELECT CONVERT(VARCHAR(5), hora_cita, 108) AS hora
        FROM Citas
        WHERE fecha_cita = @fecha
          AND estado <> 'cancelada'
      `);

    res.json({ ok: true, ocupados: result.recordset.map(r => r.hora) });

  } catch (err) {
    console.error('Error horarios:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.', ocupados: [] });
  }
});

// ── MIS CITAS (usuario logueado) ──────────────
// GET /api/citas/mis-citas
router.get('/mis-citas', verificarToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_usuario', sql.Int, req.usuario.id_usuario)
      .query(`
        SELECT
          c.id_cita,
          c.numero_turno,
          cl.nombre,
          cl.apellido,
          s.nombre  AS servicio,
          s.precio,
          CONVERT(VARCHAR(10), c.fecha_cita, 23) AS fecha_cita,
          CONVERT(VARCHAR(5),  c.hora_cita, 108)  AS hora_cita,
          c.estado,
          c.fecha_creacion,
          YEAR(c.fecha_cita) AS anio
        FROM Citas c
        JOIN Clientes cl ON c.id_cliente = cl.id_cliente
        JOIN Servicios s  ON c.id_servicio = s.id_servicio
        WHERE cl.telefono = (
          SELECT telefono FROM Usuarios WHERE id_usuario = @id_usuario
        )
        ORDER BY c.fecha_cita DESC, c.hora_cita DESC
      `);

    res.json({ ok: true, citas: result.recordset });

  } catch (err) {
    console.error('Error mis-citas:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

// ── CITAS DE HOY — SOLO ADMIN ─────────────────
// GET /api/citas/hoy
router.get('/hoy', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT
          c.id_cita,
          c.numero_turno,
          c.estado,
          cl.nombre,
          cl.apellido,
          cl.telefono,
          s.nombre  AS servicio,
          s.precio,
          CONVERT(VARCHAR(5), c.hora_cita, 108) AS hora_cita,
          c.fecha_cita
        FROM Citas c
        JOIN Clientes cl ON c.id_cliente = cl.id_cliente
        JOIN Servicios s  ON c.id_servicio = s.id_servicio
        WHERE CAST(c.fecha_cita AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY c.numero_turno ASC
      `);

    res.json({ ok: true, citas: result.recordset });

  } catch (err) {
    console.error('Error citas hoy:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

// ── TODAS LAS CITAS (admin, con filtros) ──────
// GET /api/citas/todas?fecha=2026-06-01&estado=pendiente
router.get('/todas', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let where = 'WHERE 1=1';
    if (fecha) {
      request.input('fecha', sql.Date, fecha);
      where += ' AND CAST(c.fecha_cita AS DATE) = @fecha';
    }
    if (estado && estado !== 'todas') {
      request.input('estado', sql.VarChar(20), estado);
      where += ' AND c.estado = @estado';
    }

    const result = await request.query(`
      SELECT
        c.id_cita,
        c.numero_turno,
        c.estado,
        cl.nombre,
        cl.apellido,
        cl.telefono,
        s.nombre AS servicio,
        s.precio,
        CONVERT(VARCHAR(10), c.fecha_cita, 23) AS fecha_cita,
        CONVERT(VARCHAR(5),  c.hora_cita, 108) AS hora_cita,
        c.fecha_creacion
      FROM Citas c
      JOIN Clientes cl ON c.id_cliente = cl.id_cliente
      JOIN Servicios s  ON c.id_servicio = s.id_servicio
      ${where}
      ORDER BY c.fecha_cita DESC, c.hora_cita ASC
    `);

    res.json({ ok: true, citas: result.recordset });

  } catch (err) {
    console.error('Error todas:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

// ── ESTADÍSTICAS ADMIN ────────────────────────
// GET /api/citas/stats
router.get('/stats', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;

    const hoy = await pool.request().query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN estado='pendiente'  THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado='completada' THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN estado='cancelada'  THEN 1 ELSE 0 END) AS canceladas,
        ISNULL(SUM(CASE WHEN estado='completada' THEN CAST(REPLACE(REPLACE(s.precio,'RD$',''),'?','0') AS DECIMAL(10,2)) ELSE 0 END),0) AS ingresos
      FROM Citas c
      JOIN Servicios s ON c.id_servicio = s.id_servicio
      WHERE CAST(c.fecha_cita AS DATE) = CAST(GETDATE() AS DATE)
    `);

    const semana = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Citas
      WHERE fecha_cita >= DATEADD(DAY,-7,CAST(GETDATE() AS DATE))
        AND estado <> 'cancelada'
    `);

    const mes = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Citas
      WHERE MONTH(fecha_cita) = MONTH(GETDATE())
        AND YEAR(fecha_cita)  = YEAR(GETDATE())
        AND estado <> 'cancelada'
    `);

    res.json({
      ok: true,
      hoy:    hoy.recordset[0],
      semana: semana.recordset[0].total,
      mes:    mes.recordset[0].total
    });

  } catch (err) {
    console.error('Error stats:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

// ── CAMBIAR ESTADO DE CITA — SOLO ADMIN ───────
// POST /api/citas/estado
router.post('/estado', verificarToken, soloAdmin, async (req, res) => {
  const { id_cita, estado } = req.body;

  const estadosValidos = ['pendiente', 'completada', 'cancelada'];
  if (!id_cita || !estadosValidos.includes(estado)) {
    return res.status(400).json({ ok: false, error: 'Datos inválidos.' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_cita', sql.Int,       id_cita)
      .input('estado',  sql.VarChar(20), estado)
      .query('UPDATE Citas SET estado = @estado WHERE id_cita = @id_cita');

    res.json({ ok: true });

  } catch (err) {
    console.error('Error estado:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

// ── ELIMINAR CITA — SOLO ADMIN ────────────────
// DELETE /api/citas/:id
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_cita', sql.Int, req.params.id)
      .query('DELETE FROM Citas WHERE id_cita = @id_cita');

    res.json({ ok: true });

  } catch (err) {
    console.error('Error eliminar:', err.message);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

module.exports = router;