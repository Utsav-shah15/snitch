import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Register from '../features/auth/pages/Register';
import Login from '../features/auth/pages/Login';
import BecomeSeller from '../features/auth/pages/BecomeSeller';
import SetPassword from '../features/auth/pages/SetPassword';
import Home from '../pages/Home';
import Browse from '../features/products/pages/Browse';
import ProductDetail from '../features/products/pages/ProductDetail';
import Cart from '../features/cart/pages/Cart';
import Checkout from '../features/cart/pages/Checkout';
import Orders from '../features/orders/pages/Orders';
import Dashboard from '../features/dashboard/pages/Overview';
import Listings from '../features/dashboard/pages/Listings';
import CreateListing from '../features/dashboard/pages/CreateListing';
import DashboardOrders from '../features/dashboard/pages/Orders';
import Wallet from '../features/dashboard/pages/Wallet';
import Offers from '../features/dashboard/pages/Offers';
import Analytics from '../features/dashboard/pages/Analytics';
import MyOffers from '../features/offers/pages/MyOffers';

export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/browse', element: <Browse /> },
            { path: '/product/:id', element: <ProductDetail /> },
            { path: '/cart', element: <Cart /> },
            { path: '/checkout', element: <Checkout /> },
            { path: '/orders', element: <Orders /> },
            { path: '/my-offers', element: <MyOffers /> },
            // Dashboard routes
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/dashboard/listings', element: <Listings /> },
            { path: '/dashboard/listings/new', element: <CreateListing /> },
            { path: '/dashboard/listings/edit/:id', element: <CreateListing /> },
            { path: '/dashboard/orders', element: <DashboardOrders /> },
            { path: '/dashboard/wallet', element: <Wallet /> },
            { path: '/dashboard/offers', element: <Offers /> },
            { path: '/dashboard/analytics', element: <Analytics /> },
        ],
    },
    { path: '/register', element: <Register /> },
    { path: '/login', element: <Login /> },
    { path: '/become-seller', element: <BecomeSeller /> },
    { path: '/set-password', element: <SetPassword /> },
]);

