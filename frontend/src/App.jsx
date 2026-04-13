import { useEffect, useMemo, useState } from 'react';

const entityConfig = {
  alumnos: {
    title: 'Alumnos',
    subtitle: 'Administra matrículas y promedios desde una interfaz clara.',
    endpoint: '/alumnos',
    fields: [
      { name: 'nombres', label: 'Nombres', type: 'text', placeholder: 'Emiliano' },
      { name: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Arceo Márquez' },
      { name: 'matricula', label: 'Matrícula', type: 'text', placeholder: 'IS2026003' },
      { name: 'promedio', label: 'Promedio', type: 'number', step: '0.1', placeholder: '94.2' },
    ],
    summary: (item) => `Matrícula ${item.matricula} · Promedio ${item.promedio}`,
  },
  profesores: {
    title: 'Profesores',
    subtitle: 'Controla horas de clase y número de empleado.',
    endpoint: '/profesores',
    fields: [
      { name: 'numeroEmpleado', label: 'Número de empleado', type: 'number', placeholder: '1307' },
      { name: 'nombres', label: 'Nombres', type: 'text', placeholder: 'Mariana' },
      { name: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Pech Cetz' },
      { name: 'horasClase', label: 'Horas de clase', type: 'number', placeholder: '18' },
    ],
    summary: (item) => `Empleado ${item.numeroEmpleado} · ${item.horasClase} h/semana`,
  },
};

const initialForms = {
  alumnos: { nombres: '', apellidos: '', matricula: '', promedio: '' },
  profesores: { numeroEmpleado: '', nombres: '', apellidos: '', horasClase: '' },
};

export default function App() {
  const [activeEntity, setActiveEntity] = useState('alumnos');
  const [data, setData] = useState({ alumnos: [], profesores: [] });
  const [forms, setForms] = useState(initialForms);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'info', text: 'Cargando información...' });
  const [pulse, setPulse] = useState(false);

  const currentConfig = useMemo(() => entityConfig[activeEntity], [activeEntity]);

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 450);
    return () => clearTimeout(timer);
  }, [activeEntity, data]);

  async function loadAll() {
    try {
      setLoading(true);
      const [alumnosRes, profesoresRes] = await Promise.all([
        fetch('/alumnos'),
        fetch('/profesores'),
      ]);

      const [alumnosJson, profesoresJson] = await Promise.all([
        alumnosRes.json(),
        profesoresRes.json(),
      ]);

      setData({ alumnos: alumnosJson, profesores: profesoresJson });
      setMessage({ type: 'success', text: 'Datos sincronizados correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo conectar con la API.' });
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForms((prev) => ({
      ...prev,
      [activeEntity]: {
        ...prev[activeEntity],
        [name]: value,
      },
    }));
  }

  function resetCurrentForm() {
    setForms((prev) => ({ ...prev, [activeEntity]: initialForms[activeEntity] }));
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = { ...forms[activeEntity] };
    const config = entityConfig[activeEntity];

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${config.endpoint}/${editingId}` : config.endpoint;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errors = Array.isArray(result.errors) ? ` ${result.errors.join(' | ')}` : '';
        throw new Error((result.message || 'Error al guardar.') + errors);
      }

      await loadAll();
      resetCurrentForm();
      setMessage({
        type: 'success',
        text: editingId ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error inesperado.' });
    }
  }

  function startEdit(item) {
    const prepared = { ...item };
    for (const key of Object.keys(prepared)) {
      if (prepared[key] === null || prepared[key] === undefined) prepared[key] = '';
    }

    setForms((prev) => ({ ...prev, [activeEntity]: prepared }));
    setEditingId(item.id);
    setMessage({ type: 'info', text: `Editando ${currentConfig.title.slice(0, -1).toLowerCase()} con id ${item.id}.` });
  }

  async function removeItem(id) {
    try {
      const response = await fetch(`${currentConfig.endpoint}/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo eliminar el registro.');
      }

      await loadAll();
      if (editingId === id) resetCurrentForm();
      setMessage({ type: 'success', text: result.message || 'Registro eliminado.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error inesperado.' });
    }
  }

  const activeData = data[activeEntity] || [];
  const stats = {
    alumnos: data.alumnos.length,
    profesores: data.profesores.length,
    promedio:
      data.alumnos.length > 0
        ? (data.alumnos.reduce((sum, item) => sum + Number(item.promedio), 0) / data.alumnos.length).toFixed(1)
        : '0.0',
  };

  return (
    <div className="page-shell">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-badge">Campus API Studio</span>
          <h1>REST en memoria, pero con presentación seria.</h1>
          <p>
            Esta interfaz consume los endpoints exigidos para alumnos y profesores
          </p>
        </div>

        <div className="hero-stats">
          <StatCard label="Alumnos" value={stats.alumnos} />
          <StatCard label="Profesores" value={stats.profesores} />
          <StatCard label="Promedio global" value={stats.promedio} />
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="glass panel navigation-panel">
          <div className="section-top">
            <div>
              <p className="eyebrow">Módulos</p>
              <h2>Panel de navegación</h2>
            </div>
          </div>

          <div className="segment-control">
            {Object.entries(entityConfig).map(([key, config]) => (
              <button
                key={key}
                className={`segment-btn ${activeEntity === key ? 'active' : ''}`}
                onClick={() => {
                  setActiveEntity(key);
                  resetCurrentForm();
                }}
              >
                <span>{config.title}</span>
                <small>{(data[key] || []).length} registros</small>
              </button>
            ))}
          </div>

          <div className={`message-box ${message.type}`}>
            <strong>Estado:</strong> {message.text}
          </div>

          <div className="api-note">
            <p>
              Endpoints activos: <code>/alumnos</code> y <code>/profesores</code>
            </p>
            <button className="ghost-btn" onClick={() => void loadAll()}>
              Volver a sincronizar
            </button>
          </div>
        </section>

        <section className={`glass panel form-panel ${pulse ? 'panel-pulse' : ''}`}>
          <div className="section-top">
            <div>
              <p className="eyebrow">Formulario</p>
              <h2>{editingId ? `Editar ${currentConfig.title.slice(0, -1)}` : `Nuevo ${currentConfig.title.slice(0, -1)}`}</h2>
              <p className="muted">{currentConfig.subtitle}</p>
            </div>
          </div>

          <form className="entity-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {currentConfig.fields.map((field) => (
                <label key={field.name} className="field">
                  <span>{field.label}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    step={field.step}
                    value={forms[activeEntity][field.name]}
                    placeholder={field.placeholder}
                    onChange={handleInputChange}
                  />
                </label>
              ))}
            </div>

            <div className="form-actions">
              <button className="primary-btn" type="submit">
                {editingId ? 'Actualizar registro' : 'Guardar registro'}
              </button>
              <button className="secondary-btn" type="button" onClick={resetCurrentForm}>
                Limpiar formulario
              </button>
            </div>
          </form>
        </section>

        <section className={`glass panel records-panel ${pulse ? 'panel-pulse' : ''}`}>
          <div className="section-top">
            <div>
              <p className="eyebrow">Listado</p>
              <h2>{currentConfig.title}</h2>
              <p className="muted">{currentConfig.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
              <p>Cargando datos…</p>
            </div>
          ) : activeData.length === 0 ? (
            <div className="empty-state">
              <h3>Sin registros</h3>
              <p>La colección está vacía. Crea el primer elemento desde el formulario.</p>
            </div>
          ) : (
            <div className="records-list">
              {activeData.map((item) => (
                <article key={item.id} className="record-card">
                  <div>
                    <p className="record-id">ID {item.id}</p>
                    <h3>{item.nombres} {item.apellidos}</h3>
                    <p className="record-summary">{currentConfig.summary(item)}</p>
                  </div>
                  <div className="record-actions">
                    <button className="mini-btn" onClick={() => startEdit(item)}>Editar</button>
                    <button className="mini-btn danger" onClick={() => void removeItem(item.id)}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
