const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let alumnos = [
  {
    id: 1,
    nombres: 'Emiliano',
    apellidos: 'Arceo Marquez',
    matricula: 'IS2026001',
    promedio: 95.5,
  },
  {
    id: 2,
    nombres: 'Ana',
    apellidos: 'Lopez Chan',
    matricula: 'IS2026002',
    promedio: 91.2,
  },
];

let profesores = [
  {
    id: 1,
    numeroEmpleado: 1201,
    nombres: 'Eduardo',
    apellidos: 'Rodriguez',
    horasClase: 20,
  },
  {
    id: 2,
    numeroEmpleado: 1202,
    nombres: 'Mariana',
    apellidos: 'Pech Cetz',
    horasClase: 16,
  },
];

function asNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

function validateAlumno(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  if (payload.nombres === undefined || payload.nombres === null || String(payload.nombres).trim() === '') {
    errors.push('nombres es obligatorio y no puede estar vacío.');
  }

  if (payload.apellidos === undefined || payload.apellidos === null || String(payload.apellidos).trim() === '') {
    errors.push('apellidos es obligatorio y no puede estar vacío.');
  }

  if (payload.matricula === undefined || payload.matricula === null || String(payload.matricula).trim() === '') {
    errors.push('matricula es obligatorio y no puede estar vacío.');
  }

  const promedio = asNumber(payload.promedio);
  if (payload.promedio === undefined || Number.isNaN(promedio)) {
    errors.push('promedio es obligatorio y debe ser numérico.');
  } else if (promedio < 0 || promedio > 100) {
    errors.push('promedio debe estar entre 0 y 100.');
  }

  return errors;
}

function validateProfesor(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return ['El cuerpo de la solicitud debe ser un objeto JSON válido.'];
  }

  const numeroEmpleado = asNumber(payload.numeroEmpleado);
  if (payload.numeroEmpleado === undefined || Number.isNaN(numeroEmpleado)) {
    errors.push('numeroEmpleado es obligatorio y debe ser numérico.');
  }

  if (payload.nombres === undefined || payload.nombres === null || String(payload.nombres).trim() === '') {
    errors.push('nombres es obligatorio y no puede estar vacío.');
  }

  if (payload.apellidos === undefined || payload.apellidos === null || String(payload.apellidos).trim() === '') {
    errors.push('apellidos es obligatorio y no puede estar vacío.');
  }

  const horasClase = asNumber(payload.horasClase);
  if (payload.horasClase === undefined || Number.isNaN(horasClase)) {
    errors.push('horasClase es obligatorio y debe ser numérico.');
  } else if (horasClase < 0) {
    errors.push('horasClase no puede ser negativo.');
  }

  return errors;
}

function normalizeAlumno(payload, id) {
  return {
    id,
    nombres: String(payload.nombres).trim(),
    apellidos: String(payload.apellidos).trim(),
    matricula: String(payload.matricula).trim(),
    promedio: asNumber(payload.promedio),
  };
}

function normalizeProfesor(payload, id) {
  return {
    id,
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

function nextId(collection) {
  if (!collection.length) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
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
    return res.status(500).json({ message: 'Error de validación.', errors });
  }

  const newAlumno = normalizeAlumno(req.body, nextId(alumnos));
  alumnos.push(newAlumno);
  res.status(201).json(newAlumno);
});

app.put('/alumnos/:id', parseId, (req, res) => {
  const index = alumnos.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Alumno no encontrado.' });
  }

  const errors = validateAlumno(req.body);
  if (errors.length) {
    return res.status(500).json({ message: 'Error de validación.', errors });
  }

  alumnos[index] = normalizeAlumno(req.body, req.resourceId);
  res.status(200).json(alumnos[index]);
});

app.delete('/alumnos/:id', parseId, (req, res) => {
  const index = alumnos.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Alumno no encontrado.' });
  }

  const deleted = alumnos[index];
  alumnos.splice(index, 1);
  res.status(200).json({ message: 'Alumno eliminado correctamente.', alumno: deleted });
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
    return res.status(500).json({ message: 'Error de validación.', errors });
  }

  const newProfesor = normalizeProfesor(req.body, nextId(profesores));
  profesores.push(newProfesor);
  res.status(201).json(newProfesor);
});

app.put('/profesores/:id', parseId, (req, res) => {
  const index = profesores.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Profesor no encontrado.' });
  }

  const errors = validateProfesor(req.body);
  if (errors.length) {
    return res.status(500).json({ message: 'Error de validación.', errors });
  }

  profesores[index] = normalizeProfesor(req.body, req.resourceId);
  res.status(200).json(profesores[index]);
});

app.delete('/profesores/:id', parseId, (req, res) => {
  const index = profesores.findIndex((item) => item.id === req.resourceId);
  if (index === -1) {
    return res.status(404).json({ message: 'Profesor no encontrado.' });
  }

  const deleted = profesores[index];
  profesores.splice(index, 1);
  res.status(200).json({ message: 'Profesor eliminado correctamente.', profesor: deleted });
});

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/alumnos') || req.path.startsWith('/profesores') || req.path.startsWith('/api/')) {
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
