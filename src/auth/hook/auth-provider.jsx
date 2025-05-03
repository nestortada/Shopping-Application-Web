import React, { useMemo } from 'react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../auth-config';

export const AuthProvider = ({ children }) => {
  // Crear msalInstance **una sola vez** usando useMemo
  const msalInstance = useMemo(() => {
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
  }, []);

  // Ahora **solo** envolvemos a los children en MsalProvider
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
