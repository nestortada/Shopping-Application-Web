import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCartContext } from '../../../context/CartContext';
import { createOrder } from '../../../services/orderService';
import { notifyNewOrder } from '../../../services/notificationService';
import { successToast, errorToast } from '../../../utils/toastUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ConfirmPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const { clearCart, cartItems } = useCartContext();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${BACKEND_URL}${API_URL}/payments/session/${sessionId}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setStatus(data.status);

        if (data.status === 'paid') {
          // Crear el pedido en la base de datos
          const locationId = localStorage.getItem('selectedLocationId') || localStorage.getItem('meson');
          const restaurantName = localStorage.getItem('restaurantName');
          const orderNumber = Math.floor(Math.random() * 1000000) + 1;
          const now = new Date();
          const estimatedPickupTime = new Date(now.getTime() + 30 * 60000);
          const formattedTime = estimatedPickupTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

          const orderProducts = cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }));

          const orderData = {
            orderNumber,
            userId: localStorage.getItem('userId'),
            products: orderProducts,
            status: 'Confirmed',
            timestamp: now.toISOString(),
            estimatedPickupTime: formattedTime,
            paymentMethod: 'tarjeta',
            locationId,
            locationName: restaurantName
          };

          try {
            const newOrder = await createOrder(orderData);
            await notifyNewOrder({
              locationId,
              locationName: restaurantName,
              orderId: newOrder.id
            });

            localStorage.setItem('orderNumber', orderNumber.toString());
            localStorage.setItem('orderStatus', 'Confirmed');
            localStorage.setItem('orderTimestamp', now.toISOString());
            localStorage.setItem('estimatedPickupTime', formattedTime);
            localStorage.setItem('totalAmount', cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toString());
            localStorage.setItem('paymentMethod', 'tarjeta');
            localStorage.setItem('currentOrderId', newOrder.id);

            clearCart();
            successToast('¡Pedido realizado con éxito!');
            setTimeout(() => navigate('/cart'), 2000);
          } catch (error) {
            console.error('Error al guardar el pedido:', error);
            errorToast('Error al procesar el pedido');
            setTimeout(() => navigate('/cart'), 2000);
          }
        } else {
          errorToast('No se pudo confirmar el pago');
          setTimeout(() => navigate('/cart'), 2000);
        }
      } catch (err) {
        console.error('Error retrieving session status:', err);
        setStatus('error');
        errorToast('Error al verificar el estado del pago');
        setTimeout(() => navigate('/cart'), 2000);
      }
    }

    if (sessionId) {
      fetchStatus();
    } else {
      setStatus('error');
      setTimeout(() => navigate('/cart'), 2000);
    }
  }, [sessionId, navigate, clearCart, cartItems]);

  let message = 'Verificando pago...';
  if (status === 'paid') {
    message = '¡Pago confirmado con éxito!';
  } else if (status === 'error') {
    message = 'No se pudo confirmar el pago.';
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-[#FBFBFA]">
      <h1 className="text-xl font-bold mb-4">Confirmación de pago</h1>
      <p className="font-paprika text-center">{message}</p>
      <p className="font-paprika text-sm mt-4 text-gray-600">Serás redirigido automáticamente...</p>
    </div>
  );
}