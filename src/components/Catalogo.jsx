import { useState } from 'react'

function Catalogo({
  productos,
  listaCategorias,
  // Estado del formulario
  nombre,
  setNombre,
  precioCompra,
  setPrecioCompra,
  precioVenta,
  setPrecioVenta,
  stock,
  setStock,
  categoria,
  setCategoria,
  idEditando,
  // Handlers
  onGuardar,
  onEliminar,
  onSeleccionarEditar,
  onLimpiar,
}) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaFiltro === '' || p.id_categoria.toString() === categoriaFiltro
    return coincideNombre && coincideCategoria
  })

  const productosBajoStock = productos.filter(p => p.stock_actual <= 5)

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* FORMULARIO */}
      <div className={`w-full lg:w-1/3 bg-white p-6 rounded-xl shadow border ${idEditando ? 'border-orange-200 sticky top-24 z-10' : 'border-gray-100 sticky top-24 z-10'}`}>
        <h3 className={`text-xl font-bold mb-5 ${idEditando ? 'text-orange-700' : 'text-gray-900'}`}>
          {idEditando ? 'Editando Producto' : 'Agregar Nuevo Producto'}
        </h3>
        <form onSubmit={onGuardar} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.10"
              placeholder="Precio Compra (S/)"
              value={precioCompra}
              onChange={e => setPrecioCompra(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              step="0.10"
              placeholder="Precio Venta (S/)"
              value={precioVenta}
              onChange={e => setPrecioVenta(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <input
            type="number"
            placeholder="Stock inicial"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {listaCategorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 font-semibold py-2 rounded-lg transition ${idEditando ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {idEditando ? 'Actualizar Producto' : 'Guardar en Catálogo'}
            </button>
            {idEditando && (
              <button
                type="button"
                onClick={onLimpiar}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="w-full lg:w-2/3">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Catálogo Completo</h3>
        {productosBajoStock.length > 0 && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 rounded-xl shadow-sm">
            <div className='flex items center mb-2'>
              <span className="text-orange-600 font-bold text-lg mr-2">Alerta de Stock Bajo</span>
              <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                {productosBajoStock.length} productos</span>
            </div>
            <p className="text-sm text-orange-700 mb-3">Los siguientes productos están a punto de agotarse. Considera llamar al proveedor:</p>
            <div className="flex flex-wrap gap-2">
              {productosBajoStock.map(p => (
                <button
                  key={p.id_producto}
                  onClick={() => onSeleccionarEditar(p)}
                  className="bg-white border border-orange-200 hover:border-orange-400 hover:shadow text-orange-800 text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium transition cursor-pointer"
                  title="Clic para editar stock"
                >
                  {p.nombre} <span className="text-red-600 font-bold ml-1">({p.stock_actual})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar producto para editar... (Ej. Azúcar)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm sm:w-64"
          >
            <option value="">Todas las categorías</option>
            {listaCategorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
            No se encontraron productos en el catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {productosFiltrados.map(p => (
              <div
                key={p.id_producto}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 hover:shadow transition"
              >
                <div>
                  <strong className="text-lg text-gray-950">{p.nombre}</strong>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                    <span className="text-gray-500">Venta:</span>
                    <strong className="text-gray-900">S/ {p.precio_venta.toFixed(2)}</strong>
                    <span className="text-gray-500">Compra:</span>
                    <span className="text-gray-700">S/ {p.precio_compra.toFixed(2)}</span>
                    <span className="text-gray-500">Stock:</span>
                    <strong className={`${p.stock_actual <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.stock_actual} ud
                    </strong>
                  </div>
                </div>
                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onSeleccionarEditar(p)}
                    className="flex-1 text-sm bg-gray-100 hover:bg-orange-50 text-orange-700 font-medium py-2 rounded-lg transition duration-150"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onEliminar(p.id_producto)}
                    className="flex-1 text-sm bg-gray-100 hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg transition duration-150"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalogo
