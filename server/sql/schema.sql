-- DGETI TRACKER SCHEMA

-- Drop existing tables if they exist (Be careful in production!)
-- DROP TABLE IF EXISTS fase_replies CASCADE;
-- DROP TABLE IF EXISTS seguimiento_mensual CASCADE;
-- DROP TABLE IF EXISTS informe_fases CASCADE;
-- DROP TABLE IF EXISTS proyectos CASCADE;
-- DROP TABLE IF EXISTS planteles CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;

-- Usuarios Table
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'read-only', -- 'admin', 'read-only', 'plantel'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Planteles Table
CREATE TABLE IF NOT EXISTS planteles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cct VARCHAR(20) UNIQUE NOT NULL,
    ubicacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proyectos Table
CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    plantel_id INTEGER REFERENCES planteles(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'Sin entregar', -- 'Sin entregar', 'En proceso', 'Completado', 'Aprobado'
    avance_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    last_admin_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Informe Phases Table (The 7 specific documents)
CREATE TABLE IF NOT EXISTS informe_fases (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    fase_nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Sin entregar', -- 'Sin entregar', 'Por Corregir', 'Correcto'
    observaciones TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messaging System for each phase
CREATE TABLE IF NOT EXISTS fase_replies (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER REFERENCES informe_fases(id) ON DELETE CASCADE,
    remitente_id INTEGER REFERENCES usuarios(id),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly Tracking Table
CREATE TABLE IF NOT EXISTS seguimiento_mensual (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    mes DATE NOT NULL,
    entrega_estado_cuenta BOOLEAN DEFAULT FALSE,
    subio_facturas BOOLEAN DEFAULT FALSE,
    cuadra_excel BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proyecto_id, mes)
);

-- Sample Data Seeding
INSERT INTO planteles (nombre, cct, ubicacion) VALUES 
('CETIS 77 - León', '11DCT0001W', 'León, Gto'),
('CBTIS 171 - Abasolo', '11DCT0002V', 'Abasolo, Gto'),
('CETIS 115 - Celaya', '11DCT0003U', 'Celaya, Gto'),
('CBTIS 65 - Irapuato', '11DCT0004T', 'Irapuato, Gto'),
('CBTIS 217 - Salamanca', '11DCT0005S', 'Salamanca, Gto')
ON CONFLICT DO NOTHING;

-- Trigger to auto-initialize phases for new proyectos
CREATE OR REPLACE FUNCTION initialize_phases()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO informe_fases (proyecto_id, fase_nombre) VALUES
    (NEW.id, 'Excel de Seguimiento del Gasto'),
    (NEW.id, 'Estados Financieros (ER)'),
    (NEW.id, 'Estados de Cuenta Bancarios'),
    (NEW.id, 'Balanza General'),
    (NEW.id, 'Balanza de Comprobación'),
    (NEW.id, 'Acta de Donación de Bienes'),
    (NEW.id, 'Acta de Hechos (Diferencias)');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_init_phases ON proyectos;
CREATE TRIGGER trg_init_phases
AFTER INSERT ON proyectos
FOR EACH ROW EXECUTE FUNCTION initialize_phases();
