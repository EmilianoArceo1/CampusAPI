# AWS Cloud Foundations - REST + React Project

Proyecto completo para la entrega de AWS Cloud Foundations.

## Qué incluye

- API REST con Express
- Entidades en memoria:
  - Alumno(id, nombres, apellidos, matricula, promedio)
  - Profesor(id, numeroEmpleado, nombres, apellidos, horasClase)
- Validaciones por vacío y tipo de dato
- Respuestas JSON
- Códigos HTTP usados:
  - 200 para consultas, actualizaciones y eliminaciones exitosas
  - 201 para creaciones exitosas
  - 404 para recursos no encontrados
  - 500 para errores de validación o error interno
- Frontend hecho con React + Vite, con diseño visual y animaciones sencillas
- El backend puede servir el frontend ya compilado

## Estructura

```bash
aws-rest-react-project/
├── backend/
│   ├── package.json
│   └── src/server.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── package.json
└── README.md
```

## Requisitos

- Node.js 18 o superior
- npm

## Cómo correrlo localmente

### 1) Instalar dependencias

```bash
npm install
npm install --workspaces
```

### 2) Probar el backend

```bash
npm run dev --workspace backend
```

La API quedará en:

```bash
http://localhost:3000
```

### 3) Probar el frontend en desarrollo

En otra terminal:

```bash
npm run dev --workspace frontend
```

El frontend quedará en:

```bash
http://localhost:5173
```

## Cómo dejarlo listo para EC2

### 1) Compilar el frontend

```bash
npm run build --workspace frontend
```

Eso genera `frontend/dist`.

### 2) Levantar solo Express

```bash
npm run start --workspace backend
```

El backend detecta `frontend/dist` y sirve la interfaz visual desde el mismo servidor.

## Endpoints requeridos

### Alumnos

- `GET /alumnos`
- `GET /alumnos/{id}`
- `POST /alumnos`
- `PUT /alumnos/{id}`
- `DELETE /alumnos/{id}`

### Profesores

- `GET /profesores`
- `GET /profesores/{id}`
- `POST /profesores`
- `PUT /profesores/{id}`
- `DELETE /profesores/{id}`

## Ejemplos de JSON

### Crear alumno

```json
{
  "nombres": "Carlos",
  "apellidos": "Mendoza Ruiz",
  "matricula": "IS2026010",
  "promedio": 92.7
}
```

### Crear profesor

```json
{
  "numeroEmpleado": 1401,
  "nombres": "Laura",
  "apellidos": "Pacheco Diaz",
  "horasClase": 18
}
```

## Despliegue sugerido en EC2

### Instalar Node.js en Amazon Linux

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
```

### Clonar y ejecutar

```bash
git clone TU_REPOSITORIO
cd aws-rest-react-project
npm install
npm install --workspaces
npm run build --workspace frontend
npm run start --workspace backend
```

### Abrir el puerto 3000 en el Security Group

Debes permitir tráfico de entrada TCP en el puerto `3000`, además de `22` para SSH.

Después podrás probar:

```bash
http://TU_DNS_PUBLICO:3000/alumnos
```

## Nota importante

Este proyecto guarda datos en memoria. Si el servidor se reinicia, la información se pierde. Eso no es un error: así lo pide la tarea.
