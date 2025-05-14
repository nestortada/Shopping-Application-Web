<<<<<<< HEAD
import React from 'react';

export default function PaymentMethodSelector({ selectedMethod, onChange }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={selectedMethod === 'card'}
          onChange={() => onChange('card')}
        />
        Tarjeta de crédito/débito
      </label>
      <label className="block">
        <input
          type="radio"
          name="paymentMethod"
          value="wallet"
          checked={selectedMethod === 'wallet'}
          onChange={() => onChange('wallet')}
        />
        Billetera digital
      </label>
    </div>
  );
=======
import React from 'react';

export default function PaymentMethodSelector({ selectedMethod, onChange }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={selectedMethod === 'card'}
          onChange={() => onChange('card')}
        />
        Tarjeta de crédito/débito
      </label>
      <label className="block">
        <input
          type="radio"
          name="paymentMethod"
          value="wallet"
          checked={selectedMethod === 'wallet'}
          onChange={() => onChange('wallet')}
        />
        Billetera digital
      </label>
    </div>
  );
>>>>>>> c6cd8408e916d3b9e06962cd004552a3bafe1093
}