//E-commerce/frontend/src/App.jsx
import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './layout/layout.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  )
}

export default App
