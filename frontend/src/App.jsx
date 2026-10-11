//E-commerce/frontend/src/App.jsx
import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { ProductContextProvider } from './context/ProductContext.jsx'
import { UserContextProvider } from './context/UserContext.jsx'
import { CartContextProvider } from './context/CartContex.jsx'
import { Toaster } from 'react-hot-toast'
import DetailProduct from './pages/DetailProduct.jsx'
function App() {
  return (
    <UserContextProvider>
      <ProductContextProvider>
        <CartContextProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/detailProduct/:id" element={<DetailProduct />} />
            </Route>
          </Routes>
        </CartContextProvider>
      </ProductContextProvider>
      <Toaster />
    </UserContextProvider>
  )
}

export default App
