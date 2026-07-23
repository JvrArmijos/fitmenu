import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, MenuItem, Paper, LinearProgress } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export const PaginaCalculadoras = () => {
  // Calculadora 1: IMC
  const [pesoImc, setPesoImc] = useState(70);
  const [alturaImc, setAlturaImc] = useState(170);
  const [imcResultado, setImcResultado] = useState(null);
  const [imcClasificacion, setImcClasificacion] = useState('');

  const calcularImc = () => {
    const altMetros = alturaImc / 100;
    const imc = parseFloat((pesoImc / (altMetros * altMetros)).toFixed(2));
    setImcResultado(imc);

    if (imc < 18.5) {
      setImcClasificacion('Bajo Peso');
    } else if (imc >= 18.5 && imc < 25) {
      setImcClasificacion('Peso Normal / Saludable');
    } else if (imc >= 25 && imc < 30) {
      setImcClasificacion('Sobrepeso');
    } else {
      setImcClasificacion('Obesidad');
    }
  };

  // Calculadora 2: Calorías Diarias (Harris-Benedict)
  const [edadCal, setEdadCal] = useState(30);
  const [sexoCal, setSexoCal] = useState('M');
  const [pesoCal, setPesoCal] = useState(70);
  const [alturaCal, setAlturaCal] = useState(170);
  const [actividadCal, setActividadCal] = useState('Moderado');
  const [caloriasResultado, setCaloriasResultado] = useState(null);

  const calcularCalorias = () => {
    // Tasa Metabólica Basal (TMB)
    let tmb = 0;
    if (sexoCal === 'M') {
      tmb = 88.362 + (13.397 * pesoCal) + (4.799 * alturaCal) - (5.677 * edadCal);
    } else {
      tmb = 447.593 + (9.247 * pesoCal) + (3.098 * alturaCal) - (4.330 * edadCal);
    }

    // Factor de Actividad
    const factores = {
      Sedentario: 1.2,
      Ligero: 1.375,
      Moderado: 1.55,
      Activo: 1.725,
      MuyActivo: 1.9
    };

    const factor = factores[actividadCal] || 1.2;
    const totalCalorias = Math.round(tmb * factor);
    setCaloriasResultado(totalCalorias);
  };

  // Calculadora 3: Agua Recomendada
  const [pesoAgua, setPesoAgua] = useState(70);
  const [aguaResultado, setAguaResultado] = useState(null);

  const calcularAgua = () => {
    // 35 ml de agua por kg de peso
    const litros = parseFloat(((pesoAgua * 35) / 1000).toFixed(2));
    const vasos = Math.round((pesoAgua * 35) / 250); // vasos de 250ml
    setAguaResultado({ litros, vasos });
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Calculadoras Nutricionales
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Herramientas interactivas para estimar tus requerimientos físicos diarios.
      </Typography>

      <Grid container spacing={4}>
        {/* CALCULADORA IMC */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon color="primary" /> Índice de Masa Corporal (IMC)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Peso (kg)"
                    value={pesoImc}
                    onChange={(e) => setPesoImc(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Altura (cm)"
                    value={alturaImc}
                    onChange={(e) => setAlturaImc(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" onClick={calcularImc}>
                    Calcular IMC
                  </Button>
                </Grid>
              </Grid>

              {imcResultado && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tu IMC estimado es:
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800, my: 0.5 }}>
                    {imcResultado} kg/m²
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Clasificación: {imcClasificacion}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CALCULADORA AGUA */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalDrinkIcon color="primary" /> Requerimiento de Agua Diario
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Peso Corporal (kg)"
                    value={pesoAgua}
                    onChange={(e) => setPesoAgua(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" onClick={calcularAgua}>
                    Calcular Hidratación
                  </Button>
                </Grid>
              </Grid>

              {aguaResultado && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Deberías consumir aproximadamente:
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800, my: 0.5 }}>
                    {aguaResultado.litros} Litros
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Equivalente a unos {aguaResultado.vasos} vasos de agua (250ml) al día.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CALCULADORA CALORÍAS */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FitnessCenterIcon color="primary" /> Tasa Metabólica Basal y Gasto Calórico
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Edad (años)"
                    value={edadCal}
                    onChange={(e) => setEdadCal(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    select
                    label="Sexo"
                    value={sexoCal}
                    onChange={(e) => setSexoCal(e.target.value)}
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Peso (kg)"
                    value={pesoCal}
                    onChange={(e) => setPesoCal(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Altura (cm)"
                    value={alturaCal}
                    onChange={(e) => setAlturaCal(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    select
                    label="Nivel de Actividad"
                    value={actividadCal}
                    onChange={(e) => setActividadCal(e.target.value)}
                  >
                    <MenuItem value="Sedentario">Sedentario</MenuItem>
                    <MenuItem value="Ligero">Ligero</MenuItem>
                    <MenuItem value="Moderado">Moderado</MenuItem>
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="MuyActivo">Muy Activo</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" size="large" onClick={calcularCalorias} sx={{ px: 4 }}>
                    Calcular Gasto Calórico Diario
                  </Button>
                </Grid>
              </Grid>

              {caloriasResultado && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Mantener Peso actual:
                      </Typography>
                      <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                        {caloriasResultado} kcal/día
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Perder Peso (Déficit Moderado):
                      </Typography>
                      <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 800 }}>
                        {caloriasResultado - 400} kcal/día
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Ganar Peso / Masa Muscular:
                      </Typography>
                      <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                        {caloriasResultado + 300} kcal/día
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaginaCalculadoras;
