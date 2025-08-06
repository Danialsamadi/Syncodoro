import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import OfflineIndicator from './OfflineIndicator'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <OfflineIndicator className="fixed bottom-4 right-4 z-50" />
    </div>
  )
}
