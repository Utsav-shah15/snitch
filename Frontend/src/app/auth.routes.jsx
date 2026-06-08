import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Register from '../features/auth/pages/Register';
import Login from '../features/auth/pages/Login';
import BecomeSeller from '../features/auth/pages/BecomeSeller';
import Home from '../pages/Home';
import Browse from '../pages/Browse';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Dashboard from '../pages/dashboard/Overview';

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
            { path: '/dashboard', element: <Dashboard /> },
        ],
    },
    { path: '/register', element: <Register /> },
    { path: '/login', element: <Login /> },
    { path: '/become-seller', element: <BecomeSeller /> },
]);
