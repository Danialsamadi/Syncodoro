import { useState } from 'react'
import { Edit3 } from 'lucide-react'

interface TaskEditorProps {
  currentTask: string
  onTaskChange: (task: string) => void
}

export default function TaskEditor({ currentTask, onTaskChange }: TaskEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [taskValue, setTaskValue] = useState(currentTask)

  const handleSave = () => {
    onTaskChange(taskValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTaskValue(currentTask)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 mb-6 px-6">
        <div className="text-sm font-medium text-gray-500 tracking-wider">
          CURRENT TASK
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={taskValue}
            onChange={(e) => setTaskValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            className="w-full text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-gray-900 outline-none"
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 mb-6 px-6">
      <div className="text-sm font-medium text-gray-500 tracking-wider">
        CURRENT TASK
      </div>
      <div className="flex items-center space-x-2 flex-1">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentTask}
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Edit3 className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}