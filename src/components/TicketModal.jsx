function TicketModal({ ticket, onCerrar }) {
  if (!ticket) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-75 print:bg-white print:absolute print:inset-0 print:block">
      <div className="bg-white p-6 rounded-2xl w-80 max-w-full shadow-2xl print:shadow-none print:w-full print:p-0 print:m-0">
        <div className="text-gray-900 font-mono text-sm print:text-xs">
          <div className="text-center mb-4">
            <h2 className="font-bold text-xl uppercase tracking-wider mb-1">BodegaEB</h2>
            <p className="text-xs">RUC: 10123456789</p>
            <p className="text-xs">Iquitos, Perú</p>
            <div className="border-b border-dashed border-gray-400 my-2"></div>
            <p>TICKET NO. #{ticket.id_venta}</p>
            <p>{ticket.fecha}</p>
            <p>Cajero: {ticket.cajero}</p>
          </div>
          <div className="border-b border-dashed border-gray-400 my-2"></div>
          <table className="w-full text-left mb-2">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-normal pb-1 w-2/3">Cant. / Prod.</th>
                <th className="font-normal pb-1 w-1/3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 align-top pr-2">{item.cantidad}x {item.nombre}</td>
                  <td className="py-1 align-top text-right">
                    S/ {(item.cantidad * (item.precio_venta || item.precio_unitario)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b border-dashed border-gray-400 my-2"></div>
          <div className="flex justify-between items-center text-lg font-bold my-2">
            <span>TOTAL:</span>
            <span>S/ {ticket.total.toFixed(2)}</span>
          </div>
          <div className="border-b border-dashed border-gray-400 my-2"></div>
          <div className="text-center mt-4">
            <p>¡Gracias por su preferencia!</p>
            <p className="text-xs mt-1">Vuelva pronto</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg"
          >
            Imprimir
          </button>
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketModal
