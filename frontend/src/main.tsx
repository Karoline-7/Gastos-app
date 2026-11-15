import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

interface Categoria {
  id: number
  nombre: string
}

interface Gasto {
  id: number
  descripcion: string
  monto: number
  fecha: string
  categoria: Categoria
}

// convierte una fecha ISO (UTC) al formato que entiende <input type="datetime-local">
function aInputLocal(iso: string) {
  const d = new Date(iso)
  const desfase = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - desfase).toISOString().slice(0, 16)
}

// fecha y hora actuales en formato de input
function ahoraLocal() {
  return aInputLocal(new Date().toISOString())
}

// muestra la fecha y hora en la zona horaria del usuario
function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function App() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(ahoraLocal())
  const [categoriaId, setCategoriaId] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    cargarCategorias()
  }, [])

  // cada vez que cambia el orden, se vuelven a pedir los gastos
  useEffect(() => {
    cargarGastos()
  }, [orden])

  // cargamos las categorias
  async function cargarCategorias() {
    const respuesta = await fetch('http://localhost:3000/categorias')
    const datos = await respuesta.json()
    setCategorias(datos)
  }

  // cargamos los gastos (el back los devuelve ordenados por fecha y hora)
  async function cargarGastos() {
    const respuesta = await fetch(`http://localhost:3000/gastos?orden=${orden}`)
    const datos = await respuesta.json()
    setGastos(datos.gastos)
  }

  // registramos una categoria
  async function registrarCategoria(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      const respuesta = await fetch('http://localhost:3000/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreCategoria.trim(),
        }),
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo registrar la categoria')
      }

      setNombreCategoria('')
      setMensaje('Categoría creada correctamente')
      await cargarCategorias()
    } catch {
      setMensaje('No se pudo crear la categoría. Puede que ya exista.')
    }
  }

  // guardamos o actualizamos un gasto
  async function guardarGasto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const datos = {
      descripcion,
      monto: Number(monto),
      fecha: new Date(fecha).toISOString(),
      categoriaId: Number(categoriaId),
    }

    const url = editandoId
      ? `http://localhost:3000/gastos/${editandoId}`
      : 'http://localhost:3000/gastos'

    try {
      const respuesta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo guardar el gasto')
      }

      setMensaje(
        editandoId
          ? 'Gasto actualizado correctamente'
          : 'Gasto registrado correctamente',
      )

      limpiarFormulario()
      await cargarGastos()
    } catch {
      setMensaje('Error al guardar el gasto')
    }
  }

  // colocamos los datos en el formulario
  function editarGasto(gasto: Gasto) {
    setEditandoId(gasto.id)
    setDescripcion(gasto.descripcion)
    setMonto(String(gasto.monto))
    setFecha(aInputLocal(gasto.fecha))
    setCategoriaId(String(gasto.categoria.id))
    setMensaje('')
  }

  // eliminamos un gasto
  async function eliminarGasto(id: number) {
    const confirmar = window.confirm(
      '¿Estás segura de que deseas eliminar este gasto?',
    )

    if (!confirmar) return

    try {
      const respuesta = await fetch(`http://localhost:3000/gastos/${id}`, {
        method: 'DELETE',
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo eliminar el gasto')
      }

      setMensaje('Gasto eliminado correctamente')
      await cargarGastos()
    } catch {
      setMensaje('Error al eliminar el gasto')
    }
  }

  // limpiamos el formulario
  function limpiarFormulario() {
    setDescripcion('')
    setMonto('')
    setFecha(ahoraLocal())
    setCategoriaId('')
    setEditandoId(null)
  }

  // cambiamos entre orden ascendente y descendente
  function cambiarOrden() {
    setOrden(orden === 'desc' ? 'asc' : 'desc')
  }

  const total = gastos.reduce(
    (suma, gasto) => suma + Number(gasto.monto),
    0,
  )

  return (
    <div className="contenedor">
      <header className="encabezado">
        <h1>Mis gastos</h1>
        <p>Administra y controla tu dinero.</p>
      </header>

      <section className="resumen">
        <div className="tarjeta">
          <h3>Dinero registrado</h3>
          <p>${total.toLocaleString('es-CO')}</p>
        </div>

        <div className="tarjeta">
          <h3>Total de gastos</h3>
          <p>{gastos.length}</p>
        </div>

        <div className="tarjeta">
          <h3>Categorías</h3>
          <p>{categorias.length}</p>
        </div>
      </section>

      <section className="seccion">
        <h2>Nueva categoría</h2>

        <form onSubmit={registrarCategoria}>
          <label>Nombre de la categoría</label>
          <input
            type="text"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            placeholder="Ejemplo: Transporte"
            required
          />

          <button type="submit">Crear categoría</button>
        </form>
      </section>

      <section className="seccion">
        <h2>{editandoId ? 'Editar gasto' : 'Registrar un gasto'}</h2>

        <form onSubmit={guardarGasto}>
          <label>Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ejemplo: Almuerzo"
            required
          />

          <label>Monto</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ejemplo: 25000"
            min="0.01"
            step="0.01"
            required
          />

          <label>Fecha y hora</label>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />

          <label>Categoría</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <button type="submit">
            {editandoId ? 'Guardar cambios' : 'Guardar gasto'}
          </button>

          {editandoId !== null && (
            <button type="button" onClick={limpiarFormulario}>
              Cancelar edición
            </button>
          )}
        </form>

        {mensaje && <p>{mensaje}</p>}
      </section>

      <section className="seccion">
        <h2>Gastos registrados</h2>

        {gastos.length === 0 ? (
          <p>No hay gastos registrados todavía.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th
                    onClick={cambiarOrden}
                    style={{ cursor: 'pointer' }}
                    aria-sort={orden === 'asc' ? 'ascending' : 'descending'}
                    title="Haz clic para cambiar el orden"
                  >
                    Fecha y Hora {orden === 'asc' ? '▲' : '▼'}
                  </th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{gasto.descripcion}</td>
                    <td>${Number(gasto.monto).toLocaleString('es-CO')}</td>
                    <td>{formatearFecha(gasto.fecha)}</td>
                    <td>{gasto.categoria?.nombre}</td>
                    <td>
                      <button type="button" onClick={() => editarGasto(gasto)}>
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarGasto(gasto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)