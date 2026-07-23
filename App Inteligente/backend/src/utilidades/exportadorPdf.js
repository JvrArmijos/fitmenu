import PDFDocument from 'pdfkit';

/**
 * Genera un PDF estructurado de la dieta del usuario y lo envía a la respuesta Express.
 * 
 * @param {Object} dieta - Objeto de dieta completo con detalles, recetas y lista de compras.
 * @param {Object} res - Objeto Response de Express.
 */
export function exportarDietaPdf(dieta, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Configurar cabeceras de respuesta para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="FitMenuLocal_Plan_${dieta.DietaId}.pdf"`);

  doc.pipe(res);

  // --- CABECERA ---
  doc.fillColor('#2E7D32').fontSize(22).text('FitMenu Local', { align: 'left' });
  doc.fillColor('#455A64').fontSize(10).text('Tu plan alimenticio personalizado con ingredientes ecuatorianos', { align: 'left' });
  doc.moveDown(0.5);
  doc.strokeColor('#2E7D32').lineWidth(2).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1.5);

  // --- INFORMACIÓN GENERAL ---
  doc.fillColor('#1A237E').fontSize(14).text('Resumen del Plan Alimenticio', { underline: true });
  doc.moveDown(0.5);
  doc.fillColor('#000000').fontSize(11);
  doc.text(`Objetivo: ${dieta.Objetivo}`);
  doc.text(`Fecha de Creación: ${new Date(dieta.FechaCreacion).toLocaleDateString('es-EC')}`);
  doc.text(`Calorías Diarias Recomendadas: ${dieta.CaloriasTotales} kcal`);
  doc.text(`Presupuesto diario estimado: $${parseFloat(dieta.PresupuestoEstimado).toFixed(2)} USD`);
  doc.moveDown(0.8);

  // Macro-nutrientes en tabla simple
  doc.fillColor('#37474F').fontSize(11).text('Distribución de Macronutrientes:', { bold: true });
  doc.fontSize(10);
  doc.text(`- Proteínas: ${dieta.ProteinasTotales} g`);
  doc.text(`- Grasas: ${dieta.GrasasTotales} g`);
  doc.text(`- Carbohidratos: ${dieta.CarbohidratosTotales} g`);
  doc.moveDown(1.5);

  // --- COMIDAS DEL DÍA ---
  doc.fillColor('#1A237E').fontSize(14).text('Menú Diario', { underline: true });
  doc.moveDown(0.5);

  if (dieta.detalles && dieta.detalles.length > 0) {
    dieta.detalles.forEach(c => {
      doc.fillColor('#2E7D32').fontSize(11).text(`${c.TipoComida}:`, { bold: true });
      doc.fillColor('#000000').fontSize(10)
        .text(`Sugerencia: ${c.AlimentoSugerido}`)
        .text(`Cantidad recomendada: ${c.Cantidad}`)
        .text(`Información Nutricional: ${c.Calorias} kcal | P: ${c.Proteinas}g | G: ${c.Grasas}g | C: ${c.Carbohidratos}g`);
      doc.moveDown(0.6);
    });
  } else {
    doc.text('No hay detalles registrados.');
  }
  doc.moveDown(1);

  // --- RECETAS ---
  doc.fillColor('#1A237E').fontSize(14).text('Recetas Recomendadas', { underline: true });
  doc.moveDown(0.5);

  if (dieta.recetas && dieta.recetas.length > 0) {
    dieta.recetas.forEach((r, index) => {
      doc.fillColor('#E65100').fontSize(11).text(`${index + 1}. ${r.Nombre} (${r.TiempoEstimadoMinutos} min)`, { bold: true });
      doc.fillColor('#000000').fontSize(10);
      doc.text('Ingredientes:', { bold: true });
      doc.text(r.Ingredientes);
      doc.text('Preparación:', { bold: true });
      doc.text(r.Preparacion);
      doc.moveDown(0.8);
    });
  } else {
    doc.text('No hay recetas asociadas.');
  }
  doc.moveDown(1);

  // --- LISTA DE COMPRAS ---
  doc.fillColor('#1A237E').fontSize(14).text('Lista de Compras (Precios referenciales localmente)', { underline: true });
  doc.moveDown(0.5);

  if (dieta.listaCompras && dieta.listaCompras.length > 0) {
    dieta.listaCompras.forEach(item => {
      doc.fillColor('#000000').fontSize(10).text(`[ ] ${item.Ingrediente} - Cantidad: ${item.Cantidad} - Costo aprox: $${parseFloat(item.CostoAproximado).toFixed(2)} USD`);
    });
  } else {
    doc.text('No hay lista de compras asociada.');
  }

  doc.end();
}

export default {
  exportarDietaPdf
};
