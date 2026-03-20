function Reportes({
  listaVentas,
  ventaSeleccionada,
  detallesVenta,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  onFiltrar,
  onLimpiarFiltros,
  onVerDetalle,
  onReimprimir,
}) {
  const ingresoTotal = listaVentas.reduce((sum, v) => sum + v.total_pagado, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* HISTORIAL + FILTROS */}
      <div className="w-full lg:w-2/3">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Historial de Ventas</h3>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 font-bold">
            Ingreso Total: S/ {ingresoTotal.toFixed(2)}
          </div>
        </div>

        {/* FILTROS DE FECHAS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            onClick={() => onFiltrar()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            Filtrar
          </button>
          {(fechaInicio || fechaFin) && (
            <button
              onClick={onLimpiarFiltros}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">ID Ticket</th>
                <th className="p-4 font-semibold text-gray-600">Fecha y Hora</th>
                <th className="p-4 font-semibold text-gray-600">Cajero</th>
                <th className="p-4 font-semibold text-gray-600">Total</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaVentas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay ventas registradas en este periodo.
                  </td>
                </tr>
              ) : (
                listaVentas.map(v => (
                  <tr
                    key={v.id_venta}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${ventaSeleccionada === v.id_venta ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-4 font-medium text-gray-900">#{v.id_venta}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(v.fecha_hora).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 text-gray-600">{v.usuarios?.nombre || 'Desconocido'}</td>
                    <td className="p-4 font-bold text-green-600">S/ {v.total_pagado.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onVerDetalle(v.id_venta)}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition font-medium mr-2"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => onReimprimir(v.id_venta, v.usuarios?.nombre || 'Desconocido', v.fecha_hora, v.total_pagado)}
                        className="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded transition"
                        title="Imprimir boleta"
                      >
                        Boleta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALLE DE VENTA */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl sticky top-24">
        <h3 className="text-xl font-bold mb-5 flex items-center justify-between text-gray-900">
          <span>Detalle del Ticket</span>
          {ventaSeleccionada && (
            <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">#{ventaSeleccionada}</span>
          )}
        </h3>

        {!ventaSeleccionada ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500">
              Selecciona una venta de la lista<br />para ver qué productos se llevaron.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {detallesVenta.map((item, idx) => (
                <li key={idx} className="flex justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <strong className="text-gray-900">{item.productos?.nombre || 'Producto Eliminado'}</strong>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.cantidad} ud. x S/ {item.precio_unitario.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-md text-gray-900">
                      S/ {(item.cantidad * item.precio_unitario).toFixed(2)}
                    </strong>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 mt-6 pt-4 text-right">
              <span className="text-sm text-gray-500 mr-3">TOTAL PAGADO:</span>
              <span className="text-2xl font-bold text-gray-900">
                S/ {detallesVenta.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Reportes
