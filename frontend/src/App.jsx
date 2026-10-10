//E-commerce/frontend/src/App.jsx
import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './layout/layout.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { UserContextProvider } from './context/UserContext.jsx'

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App
