// src/pages/RedirectHandler.jsx
import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

export default function RedirectHandler() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    instance.handleRedirectPromise()
      .then(() => {
        
        navigate('/', { replace: true });
      })
      .catch(console.error);
  }, [instance, navigate]);

  return <p>Procesando retorno de Microsoft…</p>;
}
