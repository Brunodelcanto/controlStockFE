import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import PrivateRoute from './components/privateRoute/PrivateRoute'
import { HomePage } from './pages/HomePage/HomePage'
import { Login } from './components/auth/login/Login'
import { Register } from './components/auth/register/Register'
import { AuthProvider } from './contexts/authContext/index.tsx'
import Category from './pages/Category/Category.tsx'
import EditCategory from './pages/Category/Components/EditCategory.tsx'
import Color from './pages/Color/Color.tsx'
import EditColor from './pages/Color/Components/EditColor.tsx'
import Products from './pages/Product/Products.tsx'
import EditProduct from './pages/Product/Components/EditProduct.tsx'
import { FallBack } from './components/fallback/FallBack.tsx'
import "./styles/global.css"

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <FallBack />
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <FallBack />
  },
  {
    path: '/',
    element: <PrivateRoute component={HomePage}/>,
    errorElement: <FallBack />
  },
  {
    path: '/categories',
    element: <PrivateRoute component={Category} />,
    errorElement: <FallBack />
  },
  {
    path: '/category-edit/:id',
    element: <PrivateRoute component={EditCategory} />,
    errorElement: <FallBack />
  },
  {
    path: '/colors',
    element: <PrivateRoute component={Color} />,
    errorElement: <FallBack />
  },
  {
    path: '/color-edit/:id',
    element: <PrivateRoute component={EditColor} />,
    errorElement: <FallBack />
  },
  {
    path: '/products',
    element: <PrivateRoute component={Products} />,
    errorElement: <FallBack />
  },
  {
    path: '/product-edit/:id',
    element: <PrivateRoute component={EditProduct} />,
    errorElement: <FallBack />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
       <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
