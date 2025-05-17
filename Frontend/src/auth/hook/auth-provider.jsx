import React, { useMemo } from 'react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../auth-config';

export const AuthProvider = ({ children }) => {
  // Verificar si la configuración MSAL está correctamente configurada
  const isMsalConfigured = useMemo(() => {
    return msalConfig.auth.clientId !== 'TU_CLIENT_ID' && 
           !msalConfig.auth.authority.includes('TU_TENANT_ID');
  }, []);

  // Crear msalInstance **una sola vez** usando useMemo, solo si está configurado
  const msalInstance = useMemo(() => {
    if (!isMsalConfigured) {
      // Si MSAL no está configurado, devolvemos null para evitar errores
      console.warn('MSAL configuration is not complete. Skipping MSAL initialization.');
      return null;
    }

    try {
      const instance = new PublicClientApplication(msalConfig);

      // Selección inicial de cuenta si ya había una sesión
      const accounts = instance.getAllAccounts();
      if (!instance.getActiveAccount() && accounts.length > 0) {
        instance.setActiveAccount(accounts[0]);
      }

      // Callback para mantener la cuenta activa tras login
      instance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS) {
          const account = event.payload?.account;
          if (account) instance.setActiveAccount(account);
        }
      });

      return instance;
    } catch (error) {
      console.error('Error initializing MSAL:', error);
      return null;
    }
  }, [isMsalConfigured]);

  // Si MSAL no está configurado o falló la inicialización, solo retornar los children sin MsalProvider
  if (!msalInstance) {
    return children;
  }

  // Si MSAL está inicializado correctamente, envolvemos los children en MsalProvider
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
