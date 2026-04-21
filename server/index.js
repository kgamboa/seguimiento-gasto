const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();
const db = require('./db');
const { format } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));

// --- API ROUTES ---

// 1. Dashboard Global Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalPlanteles = await db.query('SELECT COUNT(*) FROM planteles');
    const globalAdvance = await db.query('SELECT AVG(avance_porcentaje) FROM proyectos');
    const statusCounts = await db.query('SELECT estado, COUNT(*) FROM proyectos GROUP BY estado');
    
    // Top 5 & Bottom 5 Ranking
    const topRanking = await db.query(`
      SELECT p.nombre, p.cct, pr.avance_porcentaje, pr.estado 
      FROM planteles p 
      JOIN proyectos pr ON p.id = pr.plantel_id 
      ORDER BY pr.avance_porcentaje DESC LIMIT 5
    `);
    
    const bottomRanking = await db.query(`
      SELECT p.nombre, p.cct, pr.avance_porcentaje, pr.estado 
      FROM planteles p 
      JOIN proyectos pr ON p.id = pr.plantel_id 
      ORDER BY pr.avance_porcentaje ASC LIMIT 5
    `);

    res.json({
      total: parseInt(totalPlanteles.rows[0].count),
      globalAverage: parseFloat(globalAdvance.rows[0].avg || 0).toFixed(2),
      statusCounts: statusCounts.rows,
      top5: topRanking.rows,
      bottom5: bottomRanking.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. List Planteles with Filters
app.get('/api/planteles', async (req, res) => {
  const { search, status, inactiveSince } = req.query;
  let sql = `
    SELECT p.*, pr.id as proyecto_id, pr.estado, pr.avance_porcentaje, pr.last_admin_activity 
    FROM planteles p 
    LEFT JOIN proyectos pr ON p.id = pr.plantel_id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (p.nombre ILIKE $${params.length} OR p.cct ILIKE $${params.length})`;
  }
  if (status) {
    params.push(status);
    sql += ` AND pr.estado = $${params.length}`;
  }
  if (inactiveSince) {
    params.push(inactiveSince);
    sql += ` AND (pr.last_admin_activity < $${params.length} OR pr.last_admin_activity IS NULL)`;
  }

  sql += ' ORDER BY p.nombre ASC';

  try {
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Plantel Detailed View
app.get('/api/plantel/:id', async (req, res) => {
  try {
    const plantel = await db.query('SELECT p.*, pr.id as proyecto_id, pr.estado, pr.avance_porcentaje FROM planteles p JOIN proyectos pr ON p.id = pr.plantel_id WHERE p.id = $1', [req.params.id]);
    if (plantel.rows.length === 0) return res.status(404).json({ error: 'Plantel no encontrado' });

    const phases = await db.query('SELECT * FROM informe_fases WHERE proyecto_id = $1 ORDER BY id ASC', [plantel.rows[0].proyecto_id]);
    const monthly = await db.query('SELECT * FROM seguimiento_mensual WHERE proyecto_id = $1 ORDER BY mes DESC', [plantel.rows[0].proyecto_id]);

    res.json({
      ...plantel.rows[0],
      phases: phases.rows,
      monthly: monthly.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Phase Status/Observations
app.patch('/api/phase/:id', async (req, res) => {
  const { estado, observaciones } = req.body;
  try {
    const result = await db.query(
      'UPDATE informe_fases SET estado = $1, observaciones = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [estado, observaciones, req.params.id]
    );

    // After updating phase, we should recalculate the project overall percentage
    const phaseData = await db.query('SELECT proyecto_id FROM informe_fases WHERE id = $1', [req.params.id]);
    const proyectoId = phaseData.rows[0].proyecto_id;

    // Calc %: Correcto weighs most.
    const allPhases = await db.query('SELECT estado FROM informe_fases WHERE proyecto_id = $1', [proyectoId]);
    const correctCount = allPhases.rows.filter(f => f.estado === 'Correcto').length;
    const inProcessCount = allPhases.rows.filter(f => f.estado === 'Por Corregir').length;
    
    // Formula check: (Correcto * 100 + InProcess * 50) / 7 phases
    let newPercentage = ((correctCount * 100 + inProcessCount * 50) / 7).toFixed(2);
    if (newPercentage > 100) newPercentage = 100;

    await db.query(
      'UPDATE proyectos SET avance_porcentaje = $1, last_admin_activity = CURRENT_TIMESTAMP WHERE id = $2',
      [newPercentage, proyectoId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Phase Messages System (Replies)
app.get('/api/phase/:id/replies', async (req, res) => {
  try {
    const replies = await db.query(`
      SELECT r.*, u.nombre as autor 
      FROM fase_replies r 
      JOIN usuarios u ON r.remitente_id = u.id 
      WHERE r.fase_id = $1 
      ORDER BY r.fecha ASC
    `, [req.params.id]);
    res.json(replies.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/phase/:id/reply', async (req, res) => {
  const { remitente_id, mensaje } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO fase_replies (fase_id, remitente_id, mensaje) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, remitente_id, mensaje]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Monthly Tracking Update
app.post('/api/monthly/:proyectoId', async (req, res) => {
  const { mes, entrega_estado_cuenta, subio_facturas, cuadra_excel, observaciones } = req.body;
  try {
    const result = await db.query(`
      INSERT INTO seguimiento_mensual (proyecto_id, mes, entrega_estado_cuenta, subio_facturas, cuadra_excel, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (proyecto_id, mes) 
      DO UPDATE SET 
        entrega_estado_cuenta = EXCLUDED.entrega_estado_cuenta,
        subio_facturas = EXCLUDED.subio_facturas,
        cuadra_excel = EXCLUDED.cuadra_excel,
        observaciones = EXCLUDED.observaciones,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [req.params.proyectoId, mes, entrega_estado_cuenta, subio_facturas, cuadra_excel, observaciones]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
