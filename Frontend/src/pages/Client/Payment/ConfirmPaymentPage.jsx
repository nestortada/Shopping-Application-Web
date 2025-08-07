import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ConfirmPaymentPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${BACKEND_URL}${API_URL}/payments/session/${sessionId}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        console.error('Error retrieving session status:', err);
        setStatus('error');
      }
    }

    if (sessionId) {
      fetchStatus();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  let message = 'Verificando pago...';
  if (status === 'paid') {
    message = '¡Pago confirmado con éxito!';
  } else if (status === 'error') {
    message = 'No se pudo confirmar el pago.';
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">Confirmación de pago</h1>
      <p className="font-paprika">{message}</p>
    </div>
  );
}