// src/pages/ForgotPage.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'

import InputBox from '../../components/InputBox'
import Button from '../../components/Button'
import emailIcon from '../../assets/correo-electronico.png'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Inicializar EmailJS con tu Public Key
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      // 1) Pido al backend que genere y guarde el token
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Error al procesar la solicitud')
      }


      // 3) Envío el correo con EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          link: result.resetLink,
          message: 'Pulsa el enlace para cambiar tu contraseña',
        }
      )

      setMessage('Correo enviado correctamente. Revisa tu bandeja de entrada.')
    } catch (err) {
      console.error('ForgotPage error:', err)
      setError(err.message)
    }
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      <header className="flex flex-col items-center mb-8">
        <img src={emailIcon} alt="Email" className="w-16 h-16 mb-4" />
        <h1 className="text-2xl font-semibold text-[#0E2F55]">
          Recuperar contraseña
        </h1>
        <p className="text-sm text-gray-600">
          Ingresa tu correo y te enviaremos un enlace para restaurarla.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <InputBox
          type="email"
          placeholder="Tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <Button
          type="submit"
          color="bg-[#0E2F55] text-white"
          text="Restaurar contraseña"
        />
      </form>

      <footer className="mt-6 text-center">
        <Link
          to="/"
          className="font-paprika text-sm sm:text-base text-[#0E2F55] underline"
        >
          Volver al inicio de sesión
        </Link>
      </footer>
    </main>
  )
}
