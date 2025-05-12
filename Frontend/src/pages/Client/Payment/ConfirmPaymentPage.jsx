import React, { useState } from 'react';
import PaymentMethodSelector from '../../../components/PaymentMethodSelector';

export default function ConfirmPaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handleConfirmPayment = () => {
    console.log(`Pago confirmado con método: ${selectedMethod}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Confirmar pago</h1>
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onChange={setSelectedMethod}
      />
      <button
        onClick={handleConfirmPayment}
        className="mt-4 w-full bg-green-500 text-white py-2 rounded"
      >
        Confirmar pago
      </button>
    </div>
  );
}