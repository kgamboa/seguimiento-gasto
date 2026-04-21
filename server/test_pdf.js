const fs = require('fs');
const pdf = require('pdf-parse');

const PDF_PATH = 'C:/RF/Dirección General de Educación Tecnológica Industrial y de Servicios/CETIS No. 150 - APASEO EL ALTO/15. FACTURAS/2026/02 FEB 26/AGUA/6FABD19B-73BE-4D12-8FB1-54E9DDEB5020.pdf';

async function test() {
    try {
        if (!fs.existsSync(PDF_PATH)) {
            console.log("PDF not found at: " + PDF_PATH);
            return;
        }
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdf(dataBuffer);
        
        console.log("--- TEXT DE PDF ---");
        // Print text partially to see structure
        console.log(data.text.substring(0, 500));
        console.log("-------------------");
        
        // Grep for Total
        const matches = data.text.match(/(Total|TOTAL|Importe|IMPORTE|Importe con letra)[:\s]*\$?\s*([\d,.]+)/g);
        console.log("Posibles totales encontrados:", matches);
    } catch (err) {
        console.error("Error al leer PDF: " + err.message);
    }
}

test();
