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
      // 1) Solicitar al backend la generación del token de reset
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}${import.meta.env.VITE_API_URL}/auth/forgot-password`,
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

      // 2) Enviar el correo con el enlace de reset
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          link: result.resetLink,
          message: 'Pulsa el enlace para cambiar tu contraseña',
        }
      )

      setMessage('Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.')
    } catch (err) {
      console.error('ForgotPage error:', err)
      setError(err.message)
    }
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center min-h-screen p-6 bg-[#FBFBFA]">
      <header className="text-center mb-8">
        <img src={emailIcon} alt="Email icon" className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0E2F55] mb-2">¿Olvidaste tu contraseña?</h1>
        <p className="text-gray-600">Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <InputBox
          type="email"
          placeholder="Tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
