import XLSX from 'xlsx';

/**
 * Genera un archivo Excel (.xlsx) estructurado con el plan de comidas y la lista de compras, y lo envía al cliente.
 * 
 * @param {Object} dieta - Dieta completa obtenida de la BD.
 * @param {Object} res - Objeto de respuesta de Express.
 */
export function exportarDietaExcel(dieta, res) {
  const wb = XLSX.utils.book_new();

  // --- HOJA 1: RESUMEN Y COMIDAS ---
  const filasPlan = [
    ['FITMENU LOCAL - PLAN ALIMENTICIO INTELIGENTE'],
    [],
    ['INFORMACIÓN GENERAL'],
    ['Objetivo', dieta.Objetivo],
    ['Fecha de Creación', new Date(dieta.FechaCreacion).toLocaleDateString('es-EC')],
    ['Calorías Totales (kcal)', dieta.CaloriasTotales],
    ['Presupuesto Estimado ($ USD)', dieta.PresupuestoEstimado],
    [],
    ['DISTRIBUCIÓN NUTRICIONAL'],
    ['Proteínas Totales (g)', dieta.ProteinasTotales],
    ['Grasas Totales (g)', dieta.GrasasTotales],
    ['Carbohidratos Totales (g)', dieta.CarbohidratosTotales],
    [],
    ['MENÚ DIARIO'],
    ['Tipo de Comida', 'Alimento Sugerido', 'Cantidad', 'Calorías (kcal)', 'Proteínas (g)', 'Grasas (g)', 'Carbohidratos (g)']
  ];

  if (dieta.detalles && dieta.detalles.length > 0) {
    dieta.detalles.forEach(c => {
      filasPlan.push([
        c.TipoComida,
        c.AlimentoSugerido,
        c.Cantidad,
        c.Calorias,
        c.Proteinas,
        c.Grasas,
        c.Carbohidratos
      ]);
    });
  }

  const wsPlan = XLSX.utils.aoa_to_sheet(filasPlan);
  XLSX.utils.book_append_sheet(wb, wsPlan, 'Menú y Nutrientes');

  // --- HOJA 2: LISTA DE COMPRAS ---
  const filasCompras = [
    ['LISTA DE COMPRAS'],
    ['Producto / Ingrediente', 'Cantidad Sugerida', 'Costo Referencial ($ USD)', 'Comprado']
  ];

  if (dieta.listaCompras && dieta.listaCompras.length > 0) {
    dieta.listaCompras.forEach(item => {
      filasCompras.push([
        item.Ingrediente,
        item.Cantidad,
        item.CostoAproximado,
        item.Comprado ? 'Sí' : 'No'
      ]);
    });
  }

  const wsCompras = XLSX.utils.aoa_to_sheet(filasCompras);
  XLSX.utils.book_append_sheet(wb, wsCompras, 'Lista de Compras');

  // Escribir libro de Excel en buffer de memoria
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  // Configurar cabeceras de Express
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="FitMenuLocal_Plan_${dieta.DietaId}.xlsx"`);
  
  res.send(excelBuffer);
}

export default {
  exportarDietaExcel
};
