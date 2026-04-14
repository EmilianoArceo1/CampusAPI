const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let alumnos = [];
let profesores = [];

function asNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function validateAlumno(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  const id = asNumber(payload.id);
  if (payload.id === undefined || !Number.isInteger(id) || id <= 0) {
    errors.push('id es obligatorio y debe ser un entero positivo.');
  }

  if (isBlank(payload.nombres)) {
    errors.push('nombres es obligatorio y no puede estar vacío.');
  }

  if (isBlank(payload.apellidos)) {
    errors.push('apellidos es obligatorio y no puede estar vacío.');
  }

  if (isBlank(payload.matricula)) {
    errors.push('matricula es obligatorio y no puede estar vacío.');
  }

  const promedio = asNumber(payload.promedio);
  if (payload.promedio === undefined || Number.isNaN(promedio)) {
    errors.push('promedio es obligatorio y debe ser numérico.');
  }

  return errors;
}

function validateProfesor(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  const id = asNumber(payload.id);
  if (payload.id === undefined || !Number.isInteger(id) || id <= 0) {
    errors.push('id es obligatorio y debe ser un entero positivo.');
  }

  const numeroEmpleado = asNumber(payload.numeroEmpleado);
  if (payload.numeroEmpleado === undefined || Number.isNaN(numeroEmpleado)) {
    errors.push('numeroEmpleado es obligatorio y debe ser numérico.');
  }

  if (isBlank(payload.nombres)) {
    errors.push('nombres es obligatorio y no puede estar vacío.');
  }

  if (isBlank(payload.apellidos)) {
    errors.push('apellidos es obligatorio y no puede estar vacío.');
  }

  const horasClase = asNumber(payload.horasClase);
  if (payload.horasClase === undefined || Number.isNaN(horasClase)) {
    errors.push('horasClase es obligatorio y debe ser numérico.');
  }

  return errors;
}

function normalizeAlumno(payload) {
  return {
    id: asNumber(payload.id),
    nombres: String(payload.nombres).trim(),
    apellidos: String(payload.apellidos).trim(),
    matricula: String(payload.matricula).trim(),
    promedio: asNumber(payload.promedio),
  };
}

function normalizeProfesor(payload) {
  return {
    id: asNumber(payload.id),
    numeroEmpleado: asNumber(payload.numeroEmpleado),
    nombres: String(payload.nombres).trim(),
    apellidos: String(payload.apellidos).trim(),
    horasClase: asNumber(payload.horasClase),
  };
}

function parseId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: 'Recurso no encontrado.' });
  }
  req.resourceId = id;
  next();
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/alumnos', (_req, res) => {
  res.status(200).json(alumnos);
});

app.get('/alumnos/:id', parseId, (req, res) => {
  const alumno = alumnos.find((item) => item.id === req.resourceId);
  if (!alumno) {
    return res.status(404).json({ message: 'Alumno no encontrado.' });
  }
  res.status(200).json(alumno);
});

app.post('/alumnos', (req, res) => {
  const errors = validateAlumno(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Error de validación.', errors });
  }

  const nuevoAlumno = normalizeAlumno(req.body);
  const exists = alumnos.some((item) => item.id === nuevoAlumno.id);

  if (exists) {
    return res.status(400).json({ message: 'Ya existe un alumno con ese id.' });
  }

  alumnos.push(nuevoAlumno);
  res.status(201).json(nuevoAlumno);
});

app.put('/alumnos/:id', parseId, (req, res) => {
  const index = alumnos.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Alumno no encontrado.' });
  }

  const errors = validateAlumno(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Error de validación.', errors });
  }

  const alumnoActualizado = normalizeAlumno(req.body);
  alumnoActualizado.id = req.resourceId;

  alumnos[index] = alumnoActualizado;
  res.status(200).json(alumnos[index]);
});

app.delete('/alumnos/:id', parseId, (req, res) => {
  const index = alumnos.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Alumno no encontrado.' });
  }

  const eliminado = alumnos[index];
  alumnos.splice(index, 1);
  res.status(200).json(eliminado);
});

app.get('/profesores', (_req, res) => {
  res.status(200).json(profesores);
});

app.get('/profesores/:id', parseId, (req, res) => {
  const profesor = profesores.find((item) => item.id === req.resourceId);
  if (!profesor) {
    return res.status(404).json({ message: 'Profesor no encontrado.' });
  }
  res.status(200).json(profesor);
});

app.post('/profesores', (req, res) => {
  const errors = validateProfesor(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Error de validación.', errors });
  }

  const nuevoProfesor = normalizeProfesor(req.body);
  const exists = profesores.some((item) => item.id === nuevoProfesor.id);

  if (exists) {
    return res.status(400).json({ message: 'Ya existe un profesor con ese id.' });
  }

  profesores.push(nuevoProfesor);
  res.status(201).json(nuevoProfesor);
});

app.put('/profesores/:id', parseId, (req, res) => {
  const index = profesores.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Profesor no encontrado.' });
  }

  const errors = validateProfesor(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Error de validación.', errors });
  }

  const profesorActualizado = normalizeProfesor(req.body);
  profesorActualizado.id = req.resourceId;

  profesores[index] = profesorActualizado;
  res.status(200).json(profesores[index]);
});

app.delete('/profesores/:id', parseId, (req, res) => {
  const index = profesores.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Profesor no encontrado.' });
  }

  const eliminado = profesores[index];
  profesores.splice(index, 1);
  res.status(200).json(eliminado);
});

function methodNotAllowed(_req, res) {
  res.status(405).json({ message: 'Método no permitido.' });
}

app.all('/alumnos', methodNotAllowed);
app.all('/alumnos/:id', methodNotAllowed);
app.all('/profesores', methodNotAllowed);
app.all('/profesores/:id', methodNotAllowed);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/alumnos') ||
      req.path.startsWith('/profesores') ||
      req.path.startsWith('/api/')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Ocurrió un error interno del servidor.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});