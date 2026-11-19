import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemePreference = 'light' | 'system' | 'dark'
export type RefreshInterval = 15 | 30 | 60

export interface AppSettings {
  theme: ThemePreference
  refreshInterval: RefreshInterval
  notifications: boolean
}

interface SettingsContextValue extends AppSettings {
  setTheme: (theme: ThemePreference) => void
  setRefreshInterval: (interval: RefreshInterval) => void
  setNotifications: (enabled: boolean) => void
}

const storageKey = 'ai-firewall.settings'
const defaults: AppSettings = { theme: 'system', refreshInterval: 30, notifications: true }
const SettingsContext = createContext<SettingsContextValue | null>(null)

function readSettings(): AppSettings {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
    if (!stored || typeof stored !== 'object') return defaults
    const values = stored as Partial<AppSettings>
    return {
      theme: values.theme === 'light' || values.theme === 'dark' || values.theme === 'system' ? values.theme : defaults.theme,
      refreshInterval: values.refreshInterval === 15 || values.refreshInterval === 60 ? values.refreshInterval : defaults.refreshInterval,
      notifications: typeof values.notifications === 'boolean' ? values.notifications : defaults.notifications,
    }
  } catch {
    return defaults
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readSettings)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings))
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
  }, [settings])

  const value = useMemo<SettingsContextValue>(() => ({
    ...settings,
    setTheme: (theme) => setSettings((current) => ({ ...current, theme })),
    setRefreshInterval: (refreshInterval) => setSettings((current) => ({ ...current, refreshInterval })),
    setNotifications: (notifications) => setSettings((current) => ({ ...current, notifications })),
  }), [settings])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export { SettingsContext }
