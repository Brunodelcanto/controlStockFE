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

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute component={HomePage}/>,
    errorElement: <div>Error loading page</div>
  },
  {
    path: '/categories',
    element: <PrivateRoute component={Category} />,
    errorElement: <div>Error loading page</div>
  },
  {
    path: '/category-edit/:id',
    element: <EditCategory/>,
    errorElement: <div>Error loading page</div>
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <div>Error loading page</div>
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <div>Error loading page</div> 
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
       <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
