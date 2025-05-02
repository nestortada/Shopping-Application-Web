import React from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from '../../App';
import { msalConfig } from '../auth-config';

export const AuthProvider = ({ children }) => {
  const msalInstance = new PublicClientApplication(msalConfig)

  // Default to using the first account if no account is active on page load
  const accounts = msalInstance.getAllAccounts();
  if (!msalInstance.getActiveAccount() && accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Listen for sign-in event and set active account
  msalInstance.addEventCallback((event) => {
    const authenticationResult = event.payload;
    const account = authenticationResult?.account;
    if (event.eventType === EventType.LOGIN_SUCCESS && account) {
      msalInstance.setActiveAccount(account);
    }
  });

  // Mount the App at the root
  const root = createRoot(document.getElementById('root'));
  root.render(<App instance={msalInstance} />);

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export function useAuthProvider() {
  return { AuthProvider };
}