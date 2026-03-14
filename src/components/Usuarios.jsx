function Usuarios({
  listaUsuarios,
  listaRoles,
  usuario,
  // Estado formulario
  nombreUsuario,
  setNombreUsuario,
  pinUsuario,
  setPinUsuario,
  rolUsuario,
  setRolUsuario,
  idUsuarioEditando,
  // Handlers
  onGuardar,
  onEliminar,
  onSeleccionarEditar,
  onLimpiar,
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* FORMULARIO */}
      <div className={`w-full lg:w-1/3 bg-white p-6 rounded-xl shadow border ${idUsuarioEditando ? 'border-purple-200 sticky top-24 z-10' : 'border-gray-100 sticky top-24 z-10'}`}>
        <h3 className={`text-xl font-bold mb-5 ${idUsuarioEditando ? 'text-purple-700' : 'text-gray-900'}`}>
          {idUsuarioEditando ? 'Editando Usuario' : 'Crear Nuevo Usuario'}
        </h3>
        <form onSubmit={onGuardar} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre del Trabajador</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={nombreUsuario}
              onChange={e => setNombreUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">PIN de Acceso (4 dígitos)</label>
            <input
              type="password"
              placeholder="****"
              maxLength="4"
              value={pinUsuario}
              onChange={e => setPinUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg tracking-widest text-lg"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rol de Sistema</label>
            <select
              value={rolUsuario}
              onChange={e => setRolUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {listaRoles.map(rol => (
                <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className={`flex-1 font-semibold py-2 rounded-lg transition ${idUsuarioEditando ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {idUsuarioEditando ? 'Actualizar Usuario' : 'Guardar Usuario'}
            </button>
            {idUsuarioEditando && (
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

      {/* TABLA DE USUARIOS */}
      <div className="w-full lg:w-2/3">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Personal del Sistema</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Rol</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaUsuarios.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando usuarios...</td></tr>
              ) : (
                listaUsuarios.map(u => {
                  const nombreRol = listaRoles.find(r => r.id_rol === u.id_rol)?.nombre || 'Desconocido'
                  const esElMismo = u.id_usuario === usuario.id_usuario
                  return (
                    <tr key={u.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-500">#{u.id_usuario}</td>
                      <td className="p-4 font-medium text-gray-900">
                        {u.nombre}
                        {esElMismo && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Tú</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.id_rol === 1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {nombreRol}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onSeleccionarEditar(u)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-purple-50 text-purple-700 rounded transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminar(u.id_usuario)}
                            disabled={esElMismo}
                            className={`px-3 py-1 text-sm rounded transition ${esElMismo ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-red-50 text-red-600'}`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Usuarios
