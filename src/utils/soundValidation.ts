// Sound type validation utilities
export const VALID_SOUND_TYPES = ['beep', 'chime', 'bell', 'notification', 'success'] as const
export type SoundType = typeof VALID_SOUND_TYPES[number]

/**
 * Validates if a sound type is valid
 */
export function isValidSoundType(soundType: string): soundType is SoundType {
  return VALID_SOUND_TYPES.includes(soundType as SoundType)
}

/**
 * Sanitizes a sound type, returning a valid sound type or default
 */
export function sanitizeSoundType(soundType: string | null | undefined): SoundType {
  if (!soundType || !isValidSoundType(soundType)) {
    return 'beep' // Default sound type
  }
  return soundType
}

/**
 * Validates and sanitizes all user settings to ensure they have valid values
 */
export function sanitizeUserSettings(settings: any): {
  pomodoroLength: number
  shortBreakLength: number
  longBreakLength: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  soundType: SoundType
  notificationsEnabled: boolean
} {
  return {
    pomodoroLength: Math.max(1, Math.min(120, Number(settings?.pomodoroLength) || 25)),
    shortBreakLength: Math.max(1, Math.min(60, Number(settings?.shortBreakLength) || 5)),
    longBreakLength: Math.max(1, Math.min(120, Number(settings?.longBreakLength) || 15)),
    sessionsUntilLongBreak: Math.max(1, Math.min(10, Number(settings?.sessionsUntilLongBreak) || 4)),
    autoStartBreaks: Boolean(settings?.autoStartBreaks),
    autoStartPomodoros: Boolean(settings?.autoStartPomodoros),
    soundEnabled: Boolean(settings?.soundEnabled ?? true),
    soundType: sanitizeSoundType(settings?.soundType),
    notificationsEnabled: Boolean(settings?.notificationsEnabled ?? true)
  }
}
