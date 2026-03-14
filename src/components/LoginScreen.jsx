function LoginScreen({ pinInput, setPinInput, errorLogin, onSubmit }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Acceso al Sistema</h1>
        <form onSubmit={onSubmit} className="space-y-4">
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
          {errorLogin && <p className="text-red-600 text-sm text-center">{errorLogin}</p>}
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

export default LoginScreen
