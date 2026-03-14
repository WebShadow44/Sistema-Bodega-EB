function Navbar({ usuario, vista, setVista, onCerrarSesion, onObtenerVentas }) {
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
            Punto de Venta
          </button>
          {usuario.id_rol === 1 && (
            <>
              <button
                onClick={() => setVista('catalogo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'catalogo' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Catálogo
              </button>
              <button
                onClick={() => setVista('usuarios')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'usuarios' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Usuarios
              </button>
              <button
                onClick={() => { setVista('reportes'); onObtenerVentas(); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${vista === 'reportes' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Reportes
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Hola, {usuario.nombre}</span>
          <button
            onClick={onCerrarSesion}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
