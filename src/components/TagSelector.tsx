import { useState, useEffect } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { Tag } from '../services/database'
import { Plus, X } from 'lucide-react'
import { getRandomTagColor } from '../utils/helpers'

export default function TagSelector() {
  const { currentTags, addTag, removeTag } = useTimer()
  const { user } = useAuth()
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [showNewTagInput, setShowNewTagInput] = useState(false)

  useEffect(() => {
    loadTags()
  }, [user])

  const loadTags = async () => {
    try {
      const tags = await dbHelpers.getTags(user?.id)
      setAvailableTags(tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user) return

    try {
      const tagId = await dbHelpers.addTag({
        userId: user.id,
        name: newTagName.trim(),
        color: getRandomTagColor(),
        synced: false
      })

      // Add to available tags
      const newTag: Tag = {
        id: tagId,
        userId: user.id,
        name: newTagName.trim(),
        color: getRandomTagColor(),
        createdAt: new Date(),
        synced: false
      }
      setAvailableTags([...availableTags, newTag])
      
      // Add to current session
      addTag(newTagName.trim())
      
      setNewTagName('')
      setShowNewTagInput(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const handleTagClick = (tagName: string) => {
    if (currentTags.includes(tagName)) {
      removeTag(tagName)
    } else {
      addTag(tagName)
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Tags</h3>
      
      {/* Current Tags */}
      {currentTags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => {
              const tagData = availableTags.find(t => t.name === tag)
              return (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  style={{
                    backgroundColor: tagData?.color ? `${tagData.color}20` : undefined,
                    color: tagData?.color || undefined
                  }}
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                currentTags.includes(tag.name)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: currentTags.includes(tag.name) ? tag.color : undefined
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Tag */}
      <div className="border-t pt-4">
        {showNewTagInput ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="Enter tag name"
              className="input-field flex-1"
              autoFocus
            />
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="btn-primary"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowNewTagInput(false)
                setNewTagName('')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewTagInput(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add new tag</span>
          </button>
        )}
      </div>
    </div>
  )
}
