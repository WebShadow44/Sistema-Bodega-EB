import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

import LoginScreen from './components/LoginScreen'
import TicketModal from './components/TicketModal'
import MisVentasModal from './components/MisVentasModal'
import Navbar from './components/Navbar'
import PuntoDeVenta from './components/PuntoDeVenta'
import Catalogo from './components/Catalogo'
import Usuarios from './components/Usuarios'
import Reportes from './components/Reportes'

function App() {
  // === ESTADOS GLOBALES Y DE VISTA ===
  const [vista, setVista] = useState('ventas')
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

  // === ESTADO DE IMPRESIÓN ===
  const [ticketAImprimir, setTicketAImprimir] = useState(null)

  // === ESTADOS DEL CATÁLOGO (FORMULARIO) ===
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

  // === ESTADOS DE REPORTES (ADMIN) ===
  const [listaVentas, setListaVentas] = useState([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [detallesVenta, setDetallesVenta] = useState([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // === ESTADOS HISTORIAL CAJERO ===
  const [modalMisVentas, setModalMisVentas] = useState(false)
  const [misUltimasVentas, setMisUltimasVentas] = useState([])

  useEffect(() => {
    if (usuario) {
      obtenerProductos()
      obtenerCategorias()
      if (usuario.id_rol === 1) {
        obtenerRoles()
        obtenerUsuariosCRUD()
        obtenerVentas()
      }
    }
  }, [usuario])

  // --- LÓGICA DE LOGIN ---
  async function intentarLogin(e) {
    e.preventDefault()
    setErrorLogin('')
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, id_rol')
      .eq('pin_acceso', pinInput)
      .single()

    if (error || !data) {
      setErrorLogin('PIN incorrecto. Inténtalo de nuevo.')
      setPinInput('')
    } else {
      setUsuario(data)
      setPinInput('')
      setVista('ventas')
    }
  }

  function cerrarSesion() {
    setUsuario(null)
    setCarrito([])
    setBusquedaVentas('')
    setCategoriaVentas('')
    setVentaSeleccionada(null)
    setDetallesVenta([])
    setTicketAImprimir(null)
    setModalMisVentas(false)
    setFechaInicio('')
    setFechaFin('')
    setVista('ventas')
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
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('id_producto', { ascending: false })
    if (data) setProductos(data)
  }

  // --- FUNCIONES DEL PUNTO DE VENTA ---
  function agregarAlCarrito(producto) {
    if (producto.stock_actual <= 0) return alert('No hay stock disponible.')
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto)
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock_actual) return alert('Superas el stock.')
      setCarrito(carrito.map(item =>
        item.id_producto === producto.id_producto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  function quitarDelCarrito(idProducto) {
    setCarrito(carrito.filter(item => item.id_producto !== idProducto))
  }

  function actualizarCantidad(idProducto, nuevaCantidad) {
    if (nuevaCantidad === '') {
      setCarrito(carrito.map(item =>
        item.id_producto === idProducto ? { ...item, cantidad: '' } : item
      ))
      return
    }
    const cantidad = parseInt(nuevaCantidad)
    if (isNaN(cantidad)) return
    setCarrito(carrito.map(item => {
      if (item.id_producto === idProducto) {
        if (cantidad > item.stock_actual) {
          alert(`Solo hay ${item.stock_actual} en stock.`)
          return { ...item, cantidad: item.stock_actual }
        }
        return { ...item, cantidad }
      }
      return item
    }))
  }

  const totalCarrito = carrito.reduce((total, item) => {
    const cant = parseInt(item.cantidad) || 0
    return total + (item.precio_venta * cant)
  }, 0)

  async function cobrarVenta() {
    if (carrito.length === 0) return alert('Carrito vacío.')
    const hayCantidadesInvalidas = carrito.some(item => item.cantidad === '' || item.cantidad <= 0)
    if (hayCantidadesInvalidas) return alert('Revisa que todas las cantidades sean válidas.')
    if (!window.confirm(`¿Confirmar venta por S/ ${totalCarrito.toFixed(2)}?`)) return

    const { data: dataVenta, error: errorVenta } = await supabase
      .from('ventas')
      .insert([{ total_pagado: totalCarrito, id_usuario: usuario.id_usuario }])
      .select()

    if (errorVenta) return alert('Error al guardar venta: ' + errorVenta.message)
    const idNuevaVenta = dataVenta[0].id_venta

    for (const item of carrito) {
      const { error: errorDetalle } = await supabase
        .from('detalle_ventas')
        .insert([{ id_venta: idNuevaVenta, id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario: item.precio_venta }])

      if (errorDetalle) {
        console.error('Error al guardar detalle:', errorDetalle.message)
        continue
      }

      const stockRestante = item.stock_actual - item.cantidad
      const { error: errorStock } = await supabase
        .from('productos')
        .update({ stock_actual: stockRestante })
        .eq('id_producto', item.id_producto)

      if (errorStock) console.error('Error al actualizar stock:', errorStock.message)
    }

    const fechaActual = new Date()
    setTicketAImprimir({
      id_venta: idNuevaVenta,
      cajero: usuario.nombre,
      fecha: fechaActual.toLocaleDateString('es-PE') + ' ' + fechaActual.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      items: [...carrito],
      total: totalCarrito,
    })

    setCarrito([])
    setBusquedaVentas('')
    obtenerProductos()
    if (usuario.id_rol === 1) obtenerVentas()
  }

  // --- FUNCIONES DEL CATÁLOGO ---
  async function guardarProducto(e) {
    e.preventDefault()
    const datos = {
      nombre,
      precio_compra: parseFloat(precioCompra) || 0,
      precio_venta: parseFloat(precioVenta),
      stock_actual: parseInt(stock),
      id_categoria: parseInt(categoria),
    }
    if (idEditando) {
      const { data } = await supabase.from('productos').update(datos).eq('id_producto', idEditando).select()
      if (data) {
        setProductos(productos.map(p => p.id_producto === idEditando ? data[0] : p))
        alert('¡Producto actualizado!')
        limpiarFormulario()
      }
    } else {
      const { data } = await supabase.from('productos').insert([datos]).select()
      if (data) {
        setProductos([data[0], ...productos])
        alert('¡Producto agregado!')
        limpiarFormulario()
      }
    }
  }

  async function eliminarProducto(id) {
    if (!window.confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('productos').delete().eq('id_producto', id)
    if (!error) setProductos(productos.filter(p => p.id_producto !== id))
  }

  function seleccionarParaEditar(producto) {
    setNombre(producto.nombre)
    setPrecioCompra(producto.precio_compra)
    setPrecioVenta(producto.precio_venta)
    setStock(producto.stock_actual)
    setCategoria(producto.id_categoria.toString())
    setIdEditando(producto.id_producto)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limpiarFormulario() {
    setNombre('')
    setPrecioCompra('')
    setPrecioVenta('')
    setStock('')
    setIdEditando(null)
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
    if (pinUsuario.length !== 4 || isNaN(pinUsuario)) return alert('El PIN debe ser un número de exactamente 4 dígitos.')
    const nombreLimpio = nombreUsuario.trim().toLowerCase()

    const usuarioConflicto = listaUsuarios.find(u => {
      if (idUsuarioEditando && u.id_usuario === idUsuarioEditando) return false
      return u.pin_acceso === pinUsuario || u.nombre.toLowerCase() === nombreLimpio
    })

    if (usuarioConflicto) {
      if (usuarioConflicto.pin_acceso === pinUsuario) return alert('Vulnerabilidad evitada: Ese PIN ya está siendo usado.')
      if (usuarioConflicto.nombre.toLowerCase() === nombreLimpio) return alert(`Vulnerabilidad evitada: El nombre "${nombreUsuario}" ya existe.`)
    }

    const datos = { nombre: nombreUsuario, pin_acceso: pinUsuario, id_rol: parseInt(rolUsuario) }

    if (idUsuarioEditando) {
      if (idUsuarioEditando === usuario.id_usuario && parseInt(rolUsuario) !== 1) {
        return alert('No puedes quitarte el rol de Administrador a ti mismo.')
      }
      const { data, error } = await supabase.from('usuarios').update(datos).eq('id_usuario', idUsuarioEditando).select()
      if (data) {
        setListaUsuarios(listaUsuarios.map(u => u.id_usuario === idUsuarioEditando ? data[0] : u))
        alert('¡Usuario actualizado!')
        limpiarFormularioUsuario()
      } else {
        alert('Error al actualizar: ' + error.message)
      }
    } else {
      const { data, error } = await supabase.from('usuarios').insert([datos]).select()
      if (data) {
        setListaUsuarios([...listaUsuarios, data[0]])
        alert('¡Usuario creado!')
        limpiarFormularioUsuario()
      } else {
        alert('Error al crear. ' + error?.message)
      }
    }
  }

  async function eliminarUsuarioFila(id) {
    if (id === usuario.id_usuario) return alert('No puedes eliminar tu propia cuenta.')
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return
    const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id)
    if (!error) {
      setListaUsuarios(listaUsuarios.filter(u => u.id_usuario !== id))
    } else {
      alert('No se puede eliminar el usuario por ventas asociadas.')
    }
  }

  function seleccionarUsuarioParaEditar(u) {
    setNombreUsuario(u.nombre)
    setPinUsuario(u.pin_acceso)
    setRolUsuario(u.id_rol.toString())
    setIdUsuarioEditando(u.id_usuario)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limpiarFormularioUsuario() {
    setNombreUsuario('')
    setPinUsuario('')
    setIdUsuarioEditando(null)
    if (listaRoles.length > 0) setRolUsuario(listaRoles[0].id_rol.toString())
  }

  // --- FUNCIONES DE REPORTES ---
  async function obtenerVentas(desdeParam, hastaParam) {
    const desde = desdeParam !== undefined ? desdeParam : fechaInicio
    const hasta = hastaParam !== undefined ? hastaParam : fechaFin

    let query = supabase
      .from('ventas')
      .select(`id_venta, total_pagado, fecha_hora, usuarios ( nombre )`)
      .order('fecha_hora', { ascending: false })

    if (desde) query = query.gte('fecha_hora', desde + 'T00:00:00')
    if (hasta) query = query.lte('fecha_hora', hasta + 'T23:59:59.999')
    if (!desde && !hasta) query = query.limit(50)

    const { data, error } = await query
    if (error) console.error('Error al cargar ventas:', error)
    if (data) setListaVentas(data)
  }

  function limpiarFiltrosFecha() {
    setFechaInicio('')
    setFechaFin('')
    obtenerVentas('', '')
  }

  async function verDetalle(idVenta) {
    setVentaSeleccionada(idVenta)
    const { data } = await supabase
      .from('detalle_ventas')
      .select(`cantidad, precio_unitario, productos ( nombre )`)
      .eq('id_venta', idVenta)
    if (data) setDetallesVenta(data)
  }

  async function reimprimirTicket(idVenta, nombreCajero, fechaHoraStr, totalPagado) {
    const { data } = await supabase
      .from('detalle_ventas')
      .select(`cantidad, precio_unitario, productos ( nombre )`)
      .eq('id_venta', idVenta)
    if (data) {
      const itemsFormateados = data.map(d => ({
        nombre: d.productos?.nombre || 'Producto Eliminado',
        cantidad: d.cantidad,
        precio_venta: d.precio_unitario,
      }))
      setTicketAImprimir({
        id_venta: idVenta,
        cajero: nombreCajero,
        fecha: new Date(fechaHoraStr + 'Z').toLocaleString('es-PE'),
        items: itemsFormateados,
        total: totalPagado,
      })
    }
  }

  // --- FUNCIONES HISTORIAL CAJERO ---
  async function abrirMisVentas() {
    const { data } = await supabase
      .from('ventas')
      .select(`id_venta, total_pagado, fecha_hora`)
      .eq('id_usuario', usuario.id_usuario)
      .order('fecha_hora', { ascending: false })
      .limit(10)

    if (data) setMisUltimasVentas(data)
    setModalMisVentas(true)
  }

  // ==========================================
  //    RENDERIZADO
  // ==========================================

  if (!usuario) {
    return (
      <LoginScreen
        pinInput={pinInput}
        setPinInput={setPinInput}
        errorLogin={errorLogin}
        onSubmit={intentarLogin}
      />
    )
  }

  return (
    <>
      <TicketModal
        ticket={ticketAImprimir}
        onCerrar={() => setTicketAImprimir(null)}
      />

      {modalMisVentas && (
        <MisVentasModal
          ventas={misUltimasVentas}
          onCerrar={() => setModalMisVentas(false)}
          onReimprimir={(v) => reimprimirTicket(v.id_venta, usuario.nombre, v.fecha_hora, v.total_pagado)}
        />
      )}

      <div className={`min-h-screen bg-gray-50 text-gray-900 ${ticketAImprimir ? 'print:hidden' : ''}`}>
        <Navbar
          usuario={usuario}
          vista={vista}
          setVista={setVista}
          onCerrarSesion={cerrarSesion}
          onObtenerVentas={obtenerVentas}
        />

        <main className="max-w-7xl mx-auto p-6 md:p-8">

          {vista === 'ventas' && (
            <PuntoDeVenta
              productos={productos}
              listaCategorias={listaCategorias}
              carrito={carrito}
              busqueda={busquedaVentas}
              setBusqueda={setBusquedaVentas}
              categoria={categoriaVentas}
              setCategoria={setCategoriaVentas}
              onAgregarAlCarrito={agregarAlCarrito}
              onQuitarDelCarrito={quitarDelCarrito}
              onActualizarCantidad={actualizarCantidad}
              totalCarrito={totalCarrito}
              onCobrar={cobrarVenta}
              onAbrirMisVentas={abrirMisVentas}
            />
          )}

          {vista === 'catalogo' && usuario.id_rol === 1 && (
            <Catalogo
              productos={productos}
              listaCategorias={listaCategorias}
              nombre={nombre}
              setNombre={setNombre}
              precioCompra={precioCompra}
              setPrecioCompra={setPrecioCompra}
              precioVenta={precioVenta}
              setPrecioVenta={setPrecioVenta}
              stock={stock}
              setStock={setStock}
              categoria={categoria}
              setCategoria={setCategoria}
              idEditando={idEditando}
              onGuardar={guardarProducto}
              onEliminar={eliminarProducto}
              onSeleccionarEditar={seleccionarParaEditar}
              onLimpiar={limpiarFormulario}
            />
          )}

          {vista === 'usuarios' && usuario.id_rol === 1 && (
            <Usuarios
              listaUsuarios={listaUsuarios}
              listaRoles={listaRoles}
              usuario={usuario}
              nombreUsuario={nombreUsuario}
              setNombreUsuario={setNombreUsuario}
              pinUsuario={pinUsuario}
              setPinUsuario={setPinUsuario}
              rolUsuario={rolUsuario}
              setRolUsuario={setRolUsuario}
              idUsuarioEditando={idUsuarioEditando}
              onGuardar={guardarUsuario}
              onEliminar={eliminarUsuarioFila}
              onSeleccionarEditar={seleccionarUsuarioParaEditar}
              onLimpiar={limpiarFormularioUsuario}
            />
          )}

          {vista === 'reportes' && usuario.id_rol === 1 && (
            <Reportes
              listaVentas={listaVentas}
              ventaSeleccionada={ventaSeleccionada}
              detallesVenta={detallesVenta}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              onFiltrar={obtenerVentas}
              onLimpiarFiltros={limpiarFiltrosFecha}
              onVerDetalle={verDetalle}
              onReimprimir={reimprimirTicket}
            />
          )}

        </main>
      </div>
    </>
  )
}

export default App