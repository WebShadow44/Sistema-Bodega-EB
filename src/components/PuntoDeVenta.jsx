function PuntoDeVenta({
  productos,
  listaCategorias,
  carrito,
  busqueda,
  setBusqueda,
  categoria,
  setCategoria,
  onAgregarAlCarrito,
  onQuitarDelCarrito,
  onActualizarCantidad,
  totalCarrito,
  onCobrar,
  onAbrirMisVentas,
  metodoPago,
  setMetodoPago,
  montoRecibido,
  setMontoRecibido,
}) {
  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoria === '' || p.id_categoria.toString() === categoria
    return coincideNombre && coincideCategoria
  })

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* CATÁLOGO DE PRODUCTOS */}
      <div className="w-full lg:w-2/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Ventas</h2>
          <button
            onClick={onAbrirMisVentas}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"
          >
            Ver Mis Últimas Ventas
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar producto... (Ej. Arroz)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
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
            No se encontraron productos con esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {productosFiltrados.map(p => (
              <button
                key={p.id_producto}
                onClick={() => onAgregarAlCarrito(p)}
                disabled={p.stock_actual <= 0}
                className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-left focus:ring-2 focus:ring-blue-200 focus:border-blue-500 group ${p.stock_actual <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
              >
                <div className="flex flex-col justify-between h-full">
                  <strong className="block text-gray-900 group-hover:text-blue-700">{p.nombre}</strong>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-green-600">S/ {p.precio_venta.toFixed(2)}</span>
                    <small className="block text-gray-500 mt-1">Stock: {p.stock_actual}</small>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CARRITO / TICKET */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl sticky top-24 flex flex-col max-h-[calc(100vh-6rem)]">

        {/*ENCABEZADO*/}
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-xl font-bold flex items-center justify-between">
            <span>Ticket Actual</span>
            <span className="text-sm text-gray-500 font-normal">{carrito.length} ítems</span>
          </h3>
        </div>

        {/*LISTA DE PRODUCTOS*/}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          {carrito.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-500">El ticket está vacío</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {carrito.map(item => (
                <li key={item.id_producto} className="flex justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <strong className="text-gray-900">{item.nombre}</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min="1"
                        max={item.stock_actual}
                        value={item.cantidad}
                        onChange={(e) => onActualizarCantidad(item.id_producto, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === '' || parseInt(e.target.value) <= 0) {
                            onActualizarCantidad(item.id_producto, '1')
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200"
                      />
                      <span className="text-sm text-gray-600">x S/ {item.precio_venta.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end justify-between">
                    <strong className="text-lg text-gray-900">
                      S/ {((parseInt(item.cantidad) || 0) * item.precio_venta).toFixed(2)}
                    </strong>
                    <button
                      onClick={() => onQuitarDelCarrito(item.id_producto)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/*ZONA DE PAGOS Y BOTÓN*/}
        <div className="flex-shrink-0 border-t border-gray-200 mt-4 pt-4 space-y-4 bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago:</label>
            <select
              value={metodoPago}
              onChange={(e) => { setMetodoPago(e.target.value); setMontoRecibido(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-200"
            >
              <option value="efectivo">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>

          {metodoPago === 'efectivo' && (
            <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div>
                <label className="block text-xs text-blue-800 font-semibold mb-1">Recibido (S/):</label>
                <input
                  type="number"
                  step="0.10"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-full px-2 py-1.5 border border-blue-200 rounded text-lg font-bold text-gray-900"
                  placeholder="Ej. 50"
                />
              </div>
              <div className="text-right flex flex-col justify-end">
                <span className="text-xs text-blue-800 font-semibold mb-1">Vuelto:</span>
                <span className={`text-xl font-bold ${(parseFloat(montoRecibido) || 0) < totalCarrito ? 'text-red-500' : 'text-green-600'}`}>
                  S/ {((parseFloat(montoRecibido) || 0) - totalCarrito >= 0) ? ((parseFloat(montoRecibido) || 0) - totalCarrito).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-3xl font-extrabold text-gray-900 pt-2 border-t border-gray-200">
            <span>TOTAL:</span>
            <span>S/ {totalCarrito.toFixed(2)}</span>
          </div>

          <button
            onClick={onCobrar}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
          >
            Cobrar y Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PuntoDeVenta
