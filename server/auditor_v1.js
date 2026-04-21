const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { XMLParser } = require('fast-xml-parser');

const RUTA_EXCEL = 'C:/RF/Dirección General de Educación Tecnológica Industrial y de Servicios/CETIS No. 150 - APASEO EL ALTO/11. SEGUIMIENTO DEL GASTO/P.I. FEB-JUL 26/CE_150 SEGUIMIENTO GASTO FEB-JUL26.xlsx';
const ORIGEN_FACTURAS = 'C:/RF/Dirección General de Educación Tecnológica Industrial y de Servicios/CETIS No. 150 - APASEO EL ALTO/15. FACTURAS/2026/02 FEB 26';

const parser = new XMLParser({ ignoreAttributes: false });

async function auditar() {
    try {
        const workbook = XLSX.readFile(RUTA_EXCEL);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log(`Auditoría para CETIS 150 - Registros: ${rows.length}\n`);

        for (let row of rows) {
            const montoExcel = parseFloat(row['MONTO'] || 0);
            const carpeta = row['LIGA DE COMPROBANTE(S)'];

            if (!carpeta) continue;

            const fullPath = path.join(ORIGEN_FACTURAS, carpeta.trim());
            let sumaReal = 0;

            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath);
                for (let file of files) {
                    if (file.toLowerCase().endsWith('.xml')) {
                        const content = fs.readFileSync(path.join(fullPath, file), 'utf8');
                        const jsonObj = parser.parse(content);
                        const comp = jsonObj['cfdi:Comprobante'] || jsonObj['Comprobante'] || jsonObj['cfdi:comprobante'];
                        if (comp && comp['@_Total']) sumaReal += parseFloat(comp['@_Total']);
                    }
                }
            }

            const diff = Math.abs(montoExcel - sumaReal);
            const status = diff < 0.1 ? '[OK]' : `[ERROR] Diff: $${diff.toFixed(2)}`;
            console.log(`${status.padEnd(8)} | ${carpeta.substring(0,25).padEnd(25)} | Ex: $${montoExcel.toFixed(2)} | Real: $${sumaReal.toFixed(2)}`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

auditar();
