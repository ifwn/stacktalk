import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url:  'https://cloaking.bernard-labs.com',
  realm: 'bernard',
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID,
});

export function initKeycloak() {
  return keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
  });
}
