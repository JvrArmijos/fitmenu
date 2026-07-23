import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText, CircularProgress } from '@mui/material';
import servicioAlimentos from '../servicios/servicioAlimentos.js';

export const SelectorUbicacion = ({
  provinciaId,
  cantonId,
  parroquiaId,
  alCambiarProvincia,
  alCambiarCanton,
  alCambiarParroquia,
  errorUbicacion = ''
}) => {
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [cargandoProvincias, setCargandoProvincias] = useState(false);
  const [cargandoCantones, setCargandoCantones] = useState(false);
  const [cargandoParroquias, setCargandoParroquias] = useState(false);

  // 1. Cargar Provincias al montar
  useEffect(() => {
    const cargarProvincias = async () => {
      setCargandoProvincias(true);
      try {
        const datos = await servicioAlimentos.obtenerProvincias();
        setProvincias(datos);
      } catch (err) {
        console.error('Error al cargar provincias:', err);
      } finally {
        setCargandoProvincias(false);
      }
    };
    cargarProvincias();
  }, []);

  // 2. Cargar Cantones cuando cambie la provincia
  useEffect(() => {
    const cargarCantones = async () => {
      if (!provinciaId) {
        setCantones([]);
        setParroquias([]);
        return;
      }
      setCargandoCantones(true);
      try {
        const datos = await servicioAlimentos.obtenerCantones(provinciaId);
        setCantones(datos);
        setParroquias([]); // Limpiar parroquias al cambiar provincia
      } catch (err) {
        console.error('Error al cargar cantones:', err);
      } finally {
        setCargandoCantones(false);
      }
    };
    cargarCantones();
  }, [provinciaId]);

  // 3. Cargar Parroquias cuando cambie el cantón
  useEffect(() => {
    const cargarParroquias = async () => {
      if (!cantonId) {
        setParroquias([]);
        return;
      }
      setCargandoParroquias(true);
      try {
        const datos = await servicioAlimentos.obtenerParroquias(cantonId);
        setParroquias(datos);
      } catch (err) {
        console.error('Error al cargar parroquias:', err);
      } finally {
        setCargandoParroquias(false);
      }
    };
    cargarParroquias();
  }, [cantonId]);

  return (
    <Grid container spacing={2}>
      {/* Provincia */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!errorUbicacion}>
          <InputLabel id="provincia-label">Provincia</InputLabel>
          <Select
            labelId="provincia-label"
            id="provincia-select"
            value={provinciaId || ''}
            label="Provincia"
            onChange={(e) => alCambiarProvincia(e.target.value)}
            disabled={cargandoProvincias}
            endAdornment={cargandoProvincias && <CircularProgress size={20} sx={{ mr: 2 }} />}
          >
            {provincias.map((p) => (
              <MenuItem key={p.ProvinciaId} value={p.ProvinciaId}>
                {p.Nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Cantón */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth disabled={!provinciaId || cargandoCantones} error={!!errorUbicacion}>
          <InputLabel id="canton-label">Cantón</InputLabel>
          <Select
            labelId="canton-label"
            id="canton-select"
            value={cantonId || ''}
            label="Cantón"
            onChange={(e) => alCambiarCanton(e.target.value)}
            endAdornment={cargandoCantones && <CircularProgress size={20} sx={{ mr: 2 }} />}
          >
            {cantones.map((c) => (
              <MenuItem key={c.CantonId} value={c.CantonId}>
                {c.Nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Parroquia */}
      <Grid item xs={12} md={4}>
        <FormControl fullWidth disabled={!cantonId || cargandoParroquias} error={!!errorUbicacion}>
          <InputLabel id="parroquia-label">Parroquia</InputLabel>
          <Select
            labelId="parroquia-label"
            id="parroquia-select"
            value={parroquiaId || ''}
            label="Parroquia"
            onChange={(e) => alCambiarParroquia(e.target.value)}
            endAdornment={cargandoParroquias && <CircularProgress size={20} sx={{ mr: 2 }} />}
          >
            {parroquias.map((p) => (
              <MenuItem key={p.ParroquiaId} value={p.ParroquiaId}>
                {p.Nombre}
              </MenuItem>
            ))}
          </Select>
          {errorUbicacion && <FormHelperText>{errorUbicacion}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default SelectorUbicacion;
