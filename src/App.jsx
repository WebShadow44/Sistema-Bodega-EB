import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

function App() {
  // === ESTADOS GLOBALES Y DE VISTA ===
  const [vista, setVista] = useState('ventas') // 'ventas', 'catalogo', 'usuarios'
  const [productos, setProductos] = useState([])
  const [listaCategorias, setListaCategorias] = useState([])

  // === ESTADOS DEL LOGIN ===
  const [usuario, setUsuario] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [errorLogin, setErrorLogin] = useState('')

  // === ESTADOS DEL PUNTO DE VENTA ===
  const [carrito, setCarrito] = useState([])
  const [busquedaVentas, setBusquedaVentas] = useState('')
  const [categoriaVentas, setCategoriaVentas] = useState('')

  // === ESTADOS DEL CATÁLOGO ===
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('')
  const [categoriaCatalogo, setCategoriaCatalogo] = useState('')
  const [nombre, setNombre] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stock, setStock] = useState('')
  const [categoria, setCategoria] = useState('')
  const [idEditando, setIdEditando] = useState(null)

  // === ESTADOS DE USUARIOS ===
  const [listaUsuarios, setListaUsuarios] = useState([])
  const [listaRoles, setListaRoles] = useState([])
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [pinUsuario, setPinUsuario] = useState('')
  const [rolUsuario, setRolUsuario] = useState('')
  const [idUsuarioEditando, setIdUsuarioEditando] = useState(null)

  useEffect(() => {
    if (usuario) {
      obtenerProductos()
      obtenerCategorias()
      // Si el usuario es administrador (rol 1), cargamos también la info de usuarios
      if (usuario.id_rol === 1) {
        obtenerRoles()
        obtenerUsuariosCRUD()
      }
    }
  }, [usuario])

  // --- LÓGICA DE LOGIN ---
  async function intentarLogin(e) {
    e.preventDefault();
    setErrorLogin('');

    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, id_rol')
      .eq('pin_acceso', pinInput)
      .single()

    if (error || !data) {
      setErrorLogin('PIN incorrecto. Inténtalo de nuevo.');
      setPinInput('');
    } else {
      setUsuario(data);
      setPinInput('');
      setVista('ventas'); // Siempre mandamos a ventas al iniciar
    }
  }

  function cerrarSesion() {
    setUsuario(null);
    setCarrito([]);
    setBusquedaVentas('');
    setCategoriaVentas('');
    setBusquedaCatalogo('');
    setCategoriaCatalogo('');
    setVista('ventas');
  }

  // --- FUNCIONES DE BASE DE DATOS (LECTURA GENERAL) ---
  async function obtenerCategorias() {
    const { data } = await supabase.from('categorias').select('*')
    if (data) {
      setListaCategorias(data)
      if (data.length > 0) setCategoria(data[0].id_categoria.toString())
    }
  }

  async function obtenerProductos() {
    const { data } = await supabase.from('productos').select('*').order('id_producto', { ascending: false })
    if (data) setProductos(data)
  }

  // --- LÓGICA DE FILTRADO ---
  const productosFiltradosVentas = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busquedaVentas.toLowerCase());
    const coincideCategoria = categoriaVentas === '' || p.id_categoria.toString() === categoriaVentas;
    return coincideNombre && coincideCategoria;
  });

  const productosFiltradosCatalogo = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase());
    const coincideCategoria = categoriaCatalogo === '' || p.id_categoria.toString() === categoriaCatalogo;
    return coincideNombre && coincideCategoria;
  });

  // --- FUNCIONES DEL PUNTO DE VENTA ---
  function agregarAlCarrito(producto) {
    if (producto.stock_actual <= 0) return alert("No hay stock disponible.");
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto)
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock_actual) return alert("Superas el stock.");
      setCarrito(carrito.map(item => item.id_producto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  function quitarDelCarrito(idProducto) {
    setCarrito(carrito.filter(item => item.id_producto !== idProducto))
  }

  function actualizarCantidad(idProducto, nuevaCantidad) {
    if (nuevaCantidad === '') {
      setCarrito(carrito.map(item => item.id_producto === idProducto ? { ...item, cantidad: '' } : item));
      return;
    }
    const cantidad = parseInt(nuevaCantidad);
    if (isNaN(cantidad)) return;

    setCarrito(carrito.map(item => {
      if (item.id_producto === idProducto) {
        if (cantidad > item.stock_actual) {
          alert(`Solo hay ${item.stock_actual} en stock.`);
          return { ...item, cantidad: item.stock_actual };
        }
        return { ...item, cantidad: cantidad };
      }
      return item;
    }));
  }

  const totalCarrito = carrito.reduce((total, item) => {
    const cant = parseInt(item.cantidad) || 0;
    return total + (item.precio_venta * cant);
  }, 0)

  async function cobrarVenta() {
    if (carrito.length === 0) return alert("Carrito vacío.");
    const hayCantidadesInvalidas = carrito.some(item => item.cantidad === '' || item.cantidad <= 0);
    if (hayCantidadesInvalidas) return alert("Revisa que todas las cantidades sean válidas.");
    if (!window.confirm(`¿Confirmar venta por S/ ${totalCarrito.toFixed(2)}?`)) return;

    const { data: dataVenta, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{ total_pagado: totalCarrito, id_usuario: usuario.id_usuario }])
      .select()

    if (errorVenta) return alert("Error al guardar venta.");
    const idNuevaVenta = dataVenta[0].id_venta

    for (const item of carrito) {
      await supabase.from('detalle_ventas').insert([{ id_venta: idNuevaVenta, id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario: item.precio_venta }])
      const stockRestante = item.stock_actual - item.cantidad
      await supabase.from('productos').update({ stock_actual: stockRestante }).eq('id_producto', item.id_producto)
    }

    alert("¡Venta exitosa!");
    setCarrito([]);
    setBusquedaVentas('');
    obtenerProductos();
  }

  // --- FUNCIONES DEL CATÁLOGO ---
  async function guardarProducto(e) {
    e.preventDefault()
    const datos = { nombre, precio_compra: parseFloat(precioCompra) || 0, precio_venta: parseFloat(precioVenta), stock_actual: parseInt(stock), id_categoria: parseInt(categoria) }

    if (idEditando) {
      const { data } = await supabase.from('productos').update(datos).eq('id_producto', idEditando).select()
      if (data) {
        setProductos(productos.map(p => p.id_producto === idEditando ? data[0] : p))
        alert("¡Producto actualizado!")
        limpiarFormulario()
      }
    } else {
      const { data } = await supabase.from('productos').insert([datos]).select()
      if (data) {
        setProductos([data[0], ...productos])
        alert("¡Producto agregado!")
        limpiarFormulario()
      }
    }
  }

  async function eliminarProducto(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from('productos').delete().eq('id_producto', id)
    if (!error) setProductos(productos.filter(p => p.id_producto !== id))
  }

  function seleccionarParaEditar(producto) {
    setNombre(producto.nombre); setPrecioCompra(producto.precio_compra); setPrecioVenta(producto.precio_venta); setStock(producto.stock_actual); setCategoria(producto.id_categoria.toString()); setIdEditando(producto.id_producto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpiarFormulario() {
    setNombre(''); setPrecioCompra(''); setPrecioVenta(''); setStock(''); setIdEditando(null);
  }

  // --- FUNCIONES DE USUARIOS ---
  async function obtenerRoles() {
    const { data } = await supabase.from('roles').select('*')
    if (data) {
      setListaRoles(data)
      if (data.length > 0) setRolUsuario(data[0].id_rol.toString())
    }
  }

  async function obtenerUsuariosCRUD() {
    const { data } = await supabase.from('usuarios').select('*').order('id_usuario', { ascending: true })
    if (data) setListaUsuarios(data)
  }

  async function guardarUsuario(e) {
    e.preventDefault()

    // 1. Validar que el PIN tenga 4 dígitos
    if (pinUsuario.length !== 4 || isNaN(pinUsuario)) {
      return alert("El PIN debe ser un número de exactamente 4 dígitos.");
    }

    // 2. Validar PINs y NOMBRES duplicados usando nuestra memoria local
    const nombreLimpio = nombreUsuario.trim().toLowerCase()// Quitamos espacios extra y pasamos a minúsculas

    const usuarioConflicto = listaUsuarios.find(u => {
      // Si estamos editando, ignoramos al propio usuario para no bloquearnos a nosotros mismos
      if (idUsuarioEditando && u.id_usuario === idUsuarioEditando) return false;

      // Comparamos si alguien más ya tiene ese PIN o ese Nombre
      const mismoPin = u.pin_acceso === pinUsuario;
      const mismoNombre = u.nombre.toLowerCase() === nombreLimpio;

      return mismoPin || mismoNombre;
    });

    // Si encontramos a un "gemelo" en la lista, lanzamos la alerta exacta
    if (usuarioConflicto) {
      if (usuarioConflicto.pin_acceso === pinUsuario) {
        return alert("Vulnerabilidad evitada: Ese PIN ya está siendo usado por otro trabajador.");
      }
      if (usuarioConflicto.nombre.toLowerCase() === nombreLimpio) {
        return alert(`Vulnerabilidad evitada: El nombre "${nombreUsuario}" ya existe. Por favor, agrégale una inicial o apellido (Ej. ${nombreUsuario} P.) para no confundir los reportes.`);
      }
    }

    const datos = { nombre: nombreUsuario, pin_acceso: pinUsuario, id_rol: parseInt(rolUsuario) }

    // 3. Guardar o Actualizar en la Base de Datos
    if (idUsuarioEditando) {
      if (idUsuarioEditando === usuario.id_usuario && parseInt(rolUsuario) !== 1) {
        return alert("No puedes quitarte el rol de Administrador a ti mismo.");
      }

      const { data, error } = await supabase.from('usuarios').update(datos).eq('id_usuario', idUsuarioEditando).select()
      if (data) {
        setListaUsuarios(listaUsuarios.map(u => u.id_usuario === idUsuarioEditando ? data[0] : u))
        alert("¡Usuario actualizado!")
        limpiarFormularioUsuario()
      } else {
        alert("Error al actualizar: " + error.message)
      }
    } else {
      const { data, error } = await supabase.from('usuarios').insert([datos]).select()
      if (data) {
        setListaUsuarios([...listaUsuarios, data[0]])
        alert("¡Usuario creado!")
        limpiarFormularioUsuario()
      } else {
        alert("Error al crear. " + error?.message)
      }
    }
  }

  async function eliminarUsuarioFila(id) {
    if (id === usuario.id_usuario) return alert("No puedes eliminar tu propia cuenta mientras estás en sesión.");
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id)
    if (!error) {
      setListaUsuarios(listaUsuarios.filter(u => u.id_usuario !== id))
    } else {
      alert("No se puede eliminar el usuario. Es probable que tenga ventas registradas a su nombre.")
    }
  }

  function seleccionarUsuarioParaEditar(u) {
    setNombreUsuario(u.nombre); setPinUsuario(u.pin_acceso); setRolUsuario(u.id_rol.toString()); setIdUsuarioEditando(u.id_usuario);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpiarFormularioUsuario() {
    setNombreUsuario(''); setPinUsuario(''); setIdUsuarioEditando(null);
    if (listaRoles.length > 0) setRolUsuario(listaRoles[0].id_rol.toString());
  }


  // ==========================================
  // === RENDERIZADO VISUAL CON TAILWIND CSS ===
  // ==========================================

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Acceso al Sistema</h1>
          <form onSubmit={intentarLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Introduce tu PIN</label>
              <input
                type="password"
                maxLength="4"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="****"
                required
              />
            </div>
            {errorLogin && (
              <p className="text-red-600 text-sm text-center">{errorLogin}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-150"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

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
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Hola, {usuario.nombre}</span>
            <button
              onClick={cerrarSesion}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">

        {/* === VISTA: PUNTO DE VENTA === */}
        {vista === 'ventas' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Catálogo de Ventas</h2>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Buscar producto... (Ej. Arroz)"
                  value={busquedaVentas}
                  onChange={(e) => setBusquedaVentas(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
                />
                <select
                  value={categoriaVentas}
                  onChange={(e) => setCategoriaVentas(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm sm:w-64"
                >
                  <option value="">Todas las categorías</option>
                  {listaCategorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {productosFiltradosVentas.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
                  No se encontraron productos con esa búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {productosFiltradosVentas.map(p => (
                    <button
                      key={p.id_producto}
                      onClick={() => agregarAlCarrito(p)}
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

            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold mb-5 flex items-center justify-between">
                <span>Ticket Actual</span>
                <span className="text-sm text-gray-500 font-normal">{carrito.length} ítems</span>
              </h3>

              {carrito.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">El ticket está vacío</p>
                </div>
              ) : (
                <ul className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
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
                            onChange={(e) => actualizarCantidad(item.id_producto, e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '' || parseInt(e.target.value) <= 0) {
                                actualizarCantidad(item.id_producto, '1');
                              }
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-200"
                          />
                          <span className="text-sm text-gray-600">x S/ {item.precio_venta.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end justify-between">
                        <strong className="text-lg text-gray-900">S/ {((parseInt(item.cantidad) || 0) * item.precio_venta).toFixed(2)}</strong>
                        <button onClick={() => quitarDelCarrito(item.id_producto)} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">SUBTOTAL:</span>
                  <span className="text-lg text-gray-800">S/ {totalCarrito.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-3xl font-extrabold text-gray-900">
                  <span>TOTAL:</span>
                  <span>S/ {totalCarrito.toFixed(2)}</span>
                </div>
                <button
                  onClick={cobrarVenta}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                >
                  Cobrar y Finalizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === VISTA: ADMINISTRAR CATÁLOGO === */}
        {vista === 'catalogo' && usuario.id_rol === 1 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            <div className={`w-full lg:w-1/3 bg-white p-6 rounded-xl shadow border ${idEditando ? 'border-orange-200 sticky top-24 z-10' : 'border-gray-100 sticky top-24 z-10'}`}>
              <h3 className={`text-xl font-bold mb-5 ${idEditando ? 'text-orange-700' : 'text-gray-900'}`}>
                {idEditando ? 'Editando Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <form onSubmit={guardarProducto} className="space-y-4">
                <input type="text" placeholder="Nombre del producto" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.10" placeholder="Precio Compra (S/)" value={precioCompra} onChange={e => setPrecioCompra(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  <input type="number" step="0.10" placeholder="Precio Venta (S/)" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <input type="number" placeholder="Stock inicial" value={stock} onChange={e => setStock(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    {listaCategorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className={`flex-1 font-semibold py-2 rounded-lg transition ${idEditando ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {idEditando ? 'Actualizar Producto' : 'Guardar en Catálogo'}
                  </button>
                  {idEditando && (
                    <button type="button" onClick={limpiarFormulario} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="w-full lg:w-2/3">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Catálogo Completo</h3>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Buscar producto para editar... (Ej. Azúcar)"
                  value={busquedaCatalogo}
                  onChange={(e) => setBusquedaCatalogo(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
                />
                <select
                  value={categoriaCatalogo}
                  onChange={(e) => setCategoriaCatalogo(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm sm:w-64"
                >
                  <option value="">Todas las categorías</option>
                  {listaCategorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {productosFiltradosCatalogo.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
                  No se encontraron productos en el catálogo.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {productosFiltradosCatalogo.map(p => (
                    <div key={p.id_producto} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 hover:shadow transition">
                      <div>
                        <strong className="text-lg text-gray-950">{p.nombre}</strong>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                          <span className="text-gray-500">Venta:</span> <strong className="text-gray-900">S/ {p.precio_venta.toFixed(2)}</strong>
                          <span className="text-gray-500">Compra:</span> <span className="text-gray-700">S/ {p.precio_compra.toFixed(2)}</span>
                          <span className="text-gray-500">Stock:</span> <strong className={`${p.stock_actual <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{p.stock_actual} ud</strong>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                        <button onClick={() => seleccionarParaEditar(p)} className="flex-1 text-sm bg-gray-100 hover:bg-orange-50 text-orange-700 font-medium py-2 rounded-lg transition duration-150">Editar</button>
                        <button onClick={() => eliminarProducto(p.id_producto)} className="flex-1 text-sm bg-gray-100 hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg transition duration-150">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === VISTA: ADMINISTRAR USUARIOS === */}
        {vista === 'usuarios' && usuario.id_rol === 1 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Formulario de Usuarios */}
            <div className={`w-full lg:w-1/3 bg-white p-6 rounded-xl shadow border ${idUsuarioEditando ? 'border-purple-200 sticky top-24 z-10' : 'border-gray-100 sticky top-24 z-10'}`}>
              <h3 className={`text-xl font-bold mb-5 ${idUsuarioEditando ? 'text-purple-700' : 'text-gray-900'}`}>
                {idUsuarioEditando ? 'Editando Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <form onSubmit={guardarUsuario} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre del Trabajador</label>
                  <input type="text" placeholder="Ej. Juan Pérez" value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">PIN de Acceso (4 dígitos)</label>
                  <input type="password" placeholder="****" maxLength="4" value={pinUsuario} onChange={e => setPinUsuario(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg tracking-widest text-lg" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Rol de Sistema</label>
                  <select value={rolUsuario} onChange={e => setRolUsuario(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    {listaRoles.map(rol => <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className={`flex-1 font-semibold py-2 rounded-lg transition ${idUsuarioEditando ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {idUsuarioEditando ? 'Actualizar Usuario' : 'Guardar Usuario'}
                  </button>
                  {idUsuarioEditando && (
                    <button type="button" onClick={limpiarFormularioUsuario} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de Usuarios */}
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
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">Cargando usuarios...</td>
                      </tr>
                    ) : (
                      listaUsuarios.map(u => {
                        const nombreRol = listaRoles.find(r => r.id_rol === u.id_rol)?.nombre || 'Desconocido';
                        const esElMismo = u.id_usuario === usuario.id_usuario;

                        return (
                          <tr key={u.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-500">#{u.id_usuario}</td>
                            <td className="p-4 font-medium text-gray-900">
                              {u.nombre}
                              {esElMismo && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Tú</span>}
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.id_rol === 1 ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                {nombreRol}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => seleccionarUsuarioParaEditar(u)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-purple-50 text-purple-700 rounded transition">Editar</button>
                                <button
                                  onClick={() => eliminarUsuarioFila(u.id_usuario)}
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
        )}

      </main>
    </div>
  )
}

export default App