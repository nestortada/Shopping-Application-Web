import LoginPage from '../pages/singup/LoginPage';
import MapPage from '../pages/singup/MapPage';
import ForgotPage from '../pages/singup/ForgotPage';
import RegisterPage from '../pages/singup/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

export const routes = [
  { id: 'login', path: '/', component: LoginPage },
  { id: 'map', path: '/map', component: MapPage },
  { id: 'forgot', path: '/forgot', component: ForgotPage },
  { id: 'register', path: '/register', component: RegisterPage },
  {id: 'reset-password', path: '/reset-password', component: ResetPasswordPage}, // Añadir ruta para el restablecimiento de contraseña
];
