const db = require('./db');

const seed = async () => {
    try {
        console.log('Seeding database...');
        
        // 1. Create Projects associated with existing planteles
        const planteles = await db.query('SELECT id FROM planteles');
        for (const p of planteles.rows) {
            // Check if project exists
            const existing = await db.query('SELECT id FROM proyectos WHERE plantel_id = $1', [p.id]);
            if (existing.rows.length === 0) {
                const pr = await db.query(
                    'INSERT INTO proyectos (plantel_id, estado, avance_porcentaje) VALUES ($1, $2, $3) RETURNING id',
                    [p.id, 'En proceso', Math.floor(Math.random() * 80) + 20]
                );
                
                // Initialize monthly for current month
                await db.query(`
                    INSERT INTO seguimiento_mensual (proyecto_id, mes, entrega_estado_cuenta, subio_facturas, cuadra_excel)
                    VALUES ($1, CURRENT_DATE, true, false, false)
                `, [pr.rows[0].id]);
            }
        }
        
        // 2. Create a default Admin user
        // Password hash for 'admin123' (bcrypt typically)
        const passwordHash = '$2a$10$X.aN1u1Z9Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z'; // Mock hash
        await db.query(`
            INSERT INTO usuarios (nombre, email, password_hash, role)
            VALUES ('Administrador Global', 'admin@dgeti.gob', $1, 'admin')
            ON CONFLICT (email) DO NOTHING
        `, [passwordHash]);

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
