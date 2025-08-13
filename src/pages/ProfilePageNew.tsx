import { Clock, Construction } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/MobileLayout'

export default function ProfilePageNew() {
  const navigate = useNavigate()

  return (
    <MobileLayout title="Profile">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-full p-5 inline-flex mb-6">
            <Construction className="w-10 h-10 text-gray-700" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
          
          <p className="text-gray-600 mb-8">
            We're working on building a better profile experience for you. 
            This feature will be available in the next update.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/')}
              className="btn-primary w-full"
            >
              Back to Timer
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
