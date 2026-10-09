// E-commerce/frontend/src/layout/layout.jsx

import { Outlet } from 'react-router'
import Navbar from '../components/Navbar/Navbar.jsx'

const Layout = () => {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-6 pb-6 pb-10">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
