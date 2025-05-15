import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartItemsCount, 
    removeFromCart, 
    updateQuantity,
    getTotalPrice 
  } = useCartContext();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/confirm-payment');
  };

  if (cartItemsCount === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
        <header className="bg-[#1D1981] text-white px-4 py-3 flex items-center">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded-full hover:bg-[#2d2991] transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-paprika">My Cart</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-600 text-xl font-paprika mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/productos')}
            className="bg-[#5947FF] text-white font-paprika px-6 py-3 rounded-xl hover:bg-[#4836e0] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
      <header className="bg-[#1D1981] text-white px-4 py-3 flex items-center">
        <button 
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-[#2d2991] transition-colors"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-paprika">My Cart</h1>
      </header>

      <main className="flex-1 max-w-[360px] mx-auto w-full px-4 pt-4 pb-32">
        <div className="bg-white rounded-3xl shadow-lg p-4 mb-4">
          {cartItems.map(item => (
            <div 
              key={item.id} 
              className="flex items-center border-b border-gray-100 py-4 last:border-b-0"
            >
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-[50px] h-[50px] object-cover rounded-lg"
              />
              
              <div className="ml-3 flex-1">
                <h3 className="font-paprika text-[16px] text-[#0F172A]">
                  {item.name}
                </h3>
                <div className="font-paprika text-[14px] text-[#0F172A]">
                  ${item.price.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                
                <span className="font-paprika text-sm w-5 text-center">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <span className="font-paprika text-gray-600">Subtotal:</span>
            <span className="font-paprika text-[#0F172A]">${getTotalPrice().toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <span className="font-paprika font-bold text-[#0F172A]">Total:</span>
            <span className="font-paprika font-bold text-[#0F172A]">${getTotalPrice().toLocaleString()}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-[360px] mx-auto p-4">
          <button
            onClick={handleCheckout}
            className="w-full bg-[#5947FF] text-white font-paprika py-3 rounded-xl hover:bg-[#4836e0] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
