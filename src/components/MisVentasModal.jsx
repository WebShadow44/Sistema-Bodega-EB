function MisVentasModal({ ventas, onCerrar, onReimprimir }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Mis últimos 10 tickets</h3>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-red-500 font-bold text-xl px-2"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {ventas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aún no has cobrado ninguna venta hoy.</p>
          ) : (
            <ul className="space-y-3">
              {ventas.map(v => (
                <li
                  key={v.id_venta}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50"
                >
                  <div>
                    <strong className="text-gray-900 block">Ticket #{v.id_venta}</strong>
                    <span className="text-xs text-gray-500">
                      {new Date(v.fecha_hora + 'Z').toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <strong className="text-green-600">S/ {v.total_pagado.toFixed(2)}</strong>
                    <button
                      onClick={() => onReimprimir(v)}
                      className="px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm font-medium rounded-lg transition"
                    >
                      Reimprimir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default MisVentasModal
