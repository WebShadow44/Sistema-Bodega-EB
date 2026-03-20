import { useState } from 'react'
import { BellIcon, ShoppingCartIcon, RectangleGroupIcon, UsersIcon, ChartPieIcon } from '@heroicons/react/24/outline'

function Navbar({ usuario, vista, setVista, onCerrarSesion, onObtenerVentas, productos = [] }) {
  const [mostrarNotis, setMostrarNotis] = useState(false)
  const productosBajoStock = productos.filter(p => p.stock_actual <= 5)
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">BodegaEB</span>
          <span className="text-sm text-gray-500">| Panel</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => setVista('ventas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'ventas' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span> Punto de Venta</span>
          </button>
          {usuario.id_rol === 1 && (
            <>
              <button
                onClick={() => setVista('catalogo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'catalogo' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <RectangleGroupIcon className="h-5 w-5" />
                <span> Catálogo</span>
              </button>
              <button
                onClick={() => setVista('usuarios')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'usuarios' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <UsersIcon className="h-5 w-5" />
                <span> Usuarios</span>
              </button>
              <button
                onClick={() => { setVista('reportes'); onObtenerVentas(); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'reportes' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ChartPieIcon className="h-5 w-5" />
                <span> Reportes</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-5">
          {usuario.id_rol === 1 && (
            <div className="relative">
              <button
                onClick={() => setMostrarNotis(!mostrarNotis)}
                className="relative text-xl text-gray-600 hover:text-blue-600 transition"
              >
                <BellIcon className="h-6 w-6" />
                {productosBajoStock.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {productosBajoStock.length}
                  </span>
                )}
              </button>

              {mostrarNotis && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-orange-800">Alertas de Stock</span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded-full">{productosBajoStock.length}</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto p-2">
                    {productosBajoStock.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Todo el stock está en orden.</p>
                    ) : (
                      productosBajoStock.map(p => (
                        <div key={p.id_producto} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 rounded-lg">
                          <span className="text-gray-700 truncate pr-2 font-medium">{p.nombre}</span>
                          <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">{p.stock_actual} ud</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => { setVista('catalogo'); setMostrarNotis(false); }}
                      className="w-full text-center text-sm font-bold text-blue-600 hover:text-blue-800 py-1"
                    >
                      Ir al Catálogo a reponer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

          <span className="text-sm font-medium text-gray-700 hidden sm:block">Hola, {usuario.nombre}</span>
          <button
            onClick={onCerrarSesion}
            className="text-sm text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
