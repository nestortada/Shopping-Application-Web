import LoginPage from '../pages/singup/LoginPage';
import MapPage from '../pages/Client/Map/MapPage';
import ForgotPage from '../pages/singup/ForgotPage';
import RegisterPage from '../pages/singup/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import MyCardsPage from '../pages/Client/Payment/MyCardsPage';
import ConfirmPaymentPage from '../pages/Client/Payment/ConfirmPaymentPage';
import AddCardPage from '../pages/Client/Payment/AddCardPage';
import ProductList from '../pages/POS/Inventary/ProductList';
import ProductsPage from '../pages/Products/ProductsPage';
import CartPage from '../pages/Cart/CartPage';

export const routes = [
  { id: 'login', path: '/', component: LoginPage },
  { id: 'map', path: '/map', component: MapPage },
  { id: 'forgot', path: '/forgot', component: ForgotPage },
  { id: 'register', path: '/register', component: RegisterPage },
  { id: 'reset-password', path: '/reset-password', component: ResetPasswordPage },
  { id: 'my-cards', path: '/cards', component: MyCardsPage },
  { id: 'confirm-payment', path: '/confirm-payment', component: ConfirmPaymentPage },
  { id: 'add-card', path: '/add-card', component: AddCardPage },  { id: 'productos', path: '/productos', component: ProductsPage },
  { id: 'products', path: '/products', component: ProductsPage },
  { id: 'inventory', path: '/inventory', component: ProductList },
  { id: 'cart', path: '/cart', component: CartPage },
]

