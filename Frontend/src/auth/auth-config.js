/*
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
*/

import { LogLevel } from '@azure/msal-browser';

/**
* Configuration object to be passed to MSAL instance on creation. 
* For a full list of MSAL.js configuration parameters, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
*/
export const msalConfig = {
    auth: {
      // Placeholder values - MSAL initialization will be skipped if these haven't been replaced
      clientId: 'TU_CLIENT_ID',
      authority: 'https://login.microsoftonline.com/TU_TENANT_ID/',
      redirectUri: window.location.origin + '/redirect',
      postLogoutRedirectUri: window.location.origin + '/',
      navigateToLoginRequestUrl: false,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
   system: {
       loggerOptions: {
           loggerCallback: (level, message, containsPii) => {
               if (containsPii) {
                   return;
               }
               switch (level) {
                   case LogLevel.Error:
                       console.error(message);
                       return;
                   case LogLevel.Info:
                       console.info(message);
                       return;
                   case LogLevel.Verbose:
                       console.debug(message);
                       return;
                   case LogLevel.Warning:
                       console.warn(message);
                       return;
                   default:
                       return;
               }
           },
       },
   },
};

/**
* Scopes you add here will be prompted for user consent during sign-in.
* By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
* For more information about OIDC scopes, visit: 
* https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
*/
export const loginRequest = {
   scopes: [],
};

/**
* An optional silentRequest object can be used to achieve silent SSO
* between applications by providing a "login_hint" property.
*/
// export const silentRequest = {
//     scopes: ["openid", "profile"],
//     loginHint: "example@domain.net"
// };

export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};