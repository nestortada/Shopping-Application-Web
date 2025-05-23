import LoginPage from '../pages/singup/LoginPage';
import MapPage from '../pages/Client/Map/MapPage';
import ForgotPage from '../pages/singup/ForgotPage';
import RegisterPage from '../pages/singup/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import MyCardsPage from '../pages/Client/Payment/MyCardsPage';
import ConfirmPaymentPage from '../pages/Client/Payment/ConfirmPaymentPage';
import AddCardPage from '../pages/Client/Payment/AddCardPage';
import ProductList from '../pages/POS/Inventory/ProductList';
import ProductsPage from '../pages/Products/ProductsPage';
import FoodPage from '../pages/Products/FoodPage';
import CartPage from '../pages/Cart/CartPage';
import FavoritesPage from '../pages/Products/FavoritesPage';
import StatusOrderPage from '../pages/Client/Order/StatusOrderPage';
import MyOrdersPage from '../pages/Client/Order/MyOrdersPage';
import PosOrdersPage from '../pages/POS/Orders/PosOrdersPage';
import TestToastPage from '../pages/TestToastPage';
import TestNotificationsPage from '../pages/TestNotificationsPage';

export const routes = [
  { id: 'login', path: '/', component: LoginPage },
  { id: 'map', path: '/map', component: MapPage },
  { id: 'forgot', path: '/forgot', component: ForgotPage },
  { id: 'register', path: '/register', component: RegisterPage },
  { id: 'reset-password', path: '/reset-password', component: ResetPasswordPage },
  { id: 'my-cards', path: '/cards', component: MyCardsPage },
  { id: 'confirm-payment', path: '/confirm-payment', component: ConfirmPaymentPage },
  { id: 'add-card', path: '/add-card', component: AddCardPage },  
  { id: 'productos', path: '/productos', component: ProductsPage },
  { id: 'products', path: '/products', component: ProductsPage },
  { id: 'products-location', path: '/products/:locationId', component: ProductsPage },
  { id: 'food', path: '/food/:locationId/:productId', component: FoodPage },
  { id: 'inventory', path: '/inventory', component: ProductList },
  { id: 'cart', path: '/cart', component: CartPage },
  { id: 'favorites', path: '/favorites', component: FavoritesPage },  { id: 'status-order', path: '/client/order/status', component: StatusOrderPage },
  { id: 'my-orders', path: '/client/orders', component: MyOrdersPage },
  { id: 'pos-orders', path: '/pos/orders', component: PosOrdersPage },
  { id: 'test-toast', path: '/test-toast', component: TestToastPage },
  { id: 'test-notifications', path: '/test-notifications', component: TestNotificationsPage },
]

