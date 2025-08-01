import { useState } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { FileText } from 'lucide-react'

export default function SessionNotes() {
  const { setSessionNotes } = useTimer()
  const [notes, setNotes] = useState('')

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setSessionNotes(value)
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Session Notes</h3>
      </div>
      
      <textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Add notes about this session..."
        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
      
      <div className="text-xs text-gray-500 mt-2">
        Notes will be saved with your session
      </div>
    </div>
  )
}
