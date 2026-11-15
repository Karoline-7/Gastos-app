
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

// convierte una fecha ISO (UTC) al formato que entiende el input
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

  // estados para filtros, ordenamiento y paginacion
  const [orden, setOrden] = useState<'ASC' | 'DESC'>('DESC')
  const [ordenarPor, setOrdenarPor] = useState('fecha')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [limite] = useState(5)
  const [total, setTotal] = useState(0)
  const [cantidad, setCantidad] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [gastoAEliminar, setGastoAEliminar] = useState<Gasto | null>(null)

  useEffect(() => {
    cargarCategorias()
  }, [])

  // actualizamos los gastos cuando cambia un filtro o el orden
  useEffect(() => {
    cargarGastos()
  }, [orden, ordenarPor, filtroCategoria, busqueda, pagina])

  // con la tecla Escape se cierra la ventana de confirmacion
  useEffect(() => {
    if (!gastoAEliminar) return

    function alPresionar(e: KeyboardEvent) {
      if (e.key === 'Escape') setGastoAEliminar(null)
    }

    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [gastoAEliminar])

  // cargamos las categorias
  async function cargarCategorias() {
    const respuesta = await fetch('http://localhost:3000/categorias')
    const datos = await respuesta.json()
    setCategorias(datos)
  }

  // cargamos los gastos con sus filtros
  async function cargarGastos() {
    const parametros = new URLSearchParams()

    parametros.append('orden', orden)
    parametros.append('ordenarPor', ordenarPor)
    parametros.append('pagina', String(pagina))
    parametros.append('limite', String(limite))

    if (filtroCategoria !== '') {
      parametros.append('categoriaId', filtroCategoria)
    }

    if (busqueda.trim() !== '') {
      parametros.append('buscar', busqueda.trim())
    }

    const respuesta = await fetch(
      `http://localhost:3000/gastos?${parametros.toString()}`
    )

    const datos = await respuesta.json()

    setGastos(datos.gastos)
    setTotal(datos.total)
    setCantidad(datos.cantidad)
    setTotalPaginas(datos.totalPaginas)
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
      setPagina(1)
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

  // eliminamos el gasto despues de confirmar en la ventana
  async function confirmarEliminar() {
    if (!gastoAEliminar) return

    const id = gastoAEliminar.id
    setGastoAEliminar(null)

    try {
      const respuesta = await fetch(`http://localhost:3000/gastos/${id}`, {
        method: 'DELETE',
      })

      if (!respuesta.ok) {
        throw new Error('No se pudo eliminar el gasto')
      }

      setMensaje('Gasto eliminado correctamente')

      if (gastos.length === 1 && pagina > 1) {
        setPagina(pagina - 1)
      } else {
        await cargarGastos()
      }
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

  // cambiamos el orden de una columna
  function cambiarOrdenPor(campo: string) {
    if (ordenarPor === campo) {
      setOrden(orden === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setOrdenarPor(campo)
      setOrden('ASC')
    }

    setPagina(1)
  }

  // cambiamos la categoria del filtro
  function cambiarFiltroCategoria(valor: string) {
    setFiltroCategoria(valor)
    setPagina(1)
  }

  // cambiamos el texto de busqueda
  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  return (
    <div className="contenedor">
      <header className="encabezado">
        <h1>Mis gastos</h1>
        <p>Administra y controla tu dinero.</p>
      </header>

      <section className="resumen">
        <div className="tarjeta">
          <h3>Dinero registrado</h3>
          <p>${Number(total).toLocaleString('es-CO')}</p>
        </div>

        <div className="tarjeta">
          <h3>Total de gastos</h3>
          <p>{cantidad}</p>
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

        <div className="filtros-gastos">
          <div>
            <label>Buscar por descripción</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
              placeholder="Ejemplo: almuerzo"
            />
          </div>

          <div>
            <label>Filtrar por categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => cambiarFiltroCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {gastos.length === 0 ? (
          <p>No hay gastos que coincidan con la búsqueda.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => cambiarOrdenPor('descripcion')}
                    style={{ cursor: 'pointer' }}
                    title="Ordenar por descripción"
                  >
                    Descripción
                    {ordenarPor === 'descripcion' &&
                      (orden === 'ASC' ? ' ▲' : ' ▼')}
                  </th>

                  <th
                    onClick={() => cambiarOrdenPor('monto')}
                    style={{ cursor: 'pointer' }}
                    title="Ordenar por monto"
                  >
                    Monto
                    {ordenarPor === 'monto' &&
                      (orden === 'ASC' ? ' ▲' : ' ▼')}
                  </th>

                  <th
                    onClick={() => cambiarOrdenPor('fecha')}
                    style={{ cursor: 'pointer' }}
                    title="Ordenar por fecha"
                  >
                    Fecha y Hora
                    {ordenarPor === 'fecha' &&
                      (orden === 'ASC' ? ' ▲' : ' ▼')}
                  </th>

                  <th
                    onClick={() => cambiarOrdenPor('categoria')}
                    style={{ cursor: 'pointer' }}
                    title="Ordenar por categoría"
                  >
                    Categoría
                    {ordenarPor === 'categoria' &&
                      (orden === 'ASC' ? ' ▲' : ' ▼')}
                  </th>

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
                        onClick={() => setGastoAEliminar(gasto)}
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

        <div className="paginacion">
          <button
            type="button"
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            Anterior
          </button>

          <span>
            Página {pagina} de {totalPaginas}
          </span>

          <button
            type="button"
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </section>

      {gastoAEliminar && (
        <div className="modal-fondo" onClick={() => setGastoAEliminar(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="titulo-modal">¿Eliminar este gasto?</h3>
            <p>
              Se eliminará <strong>{gastoAEliminar.descripcion}</strong> por{' '}
              <strong>
                ${Number(gastoAEliminar.monto).toLocaleString('es-CO')}
              </strong>
              . Esta acción no se puede deshacer.
            </p>

            <div className="modal-botones">
              <button
                type="button"
                className="boton-cancelar"
                onClick={() => setGastoAEliminar(null)}
                autoFocus
              >
                Cancelar
              </button>

              <button
                type="button"
                className="boton-eliminar"
                onClick={confirmarEliminar}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
