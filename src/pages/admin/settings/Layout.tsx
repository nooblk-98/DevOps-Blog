import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const items = [
  { to: 'site', label: 'Site Identity' },
  { to: 'banner', label: 'Homepage Banner' },
  { to: 'about', label: 'About Page' },
  { to: 'backup', label: 'Backup & Restore' },
  { to: 'sharing', label: 'Social Sharing' },
  { to: 'social', label: 'Social Links' },
]

export default function AdminSettingsLayout() {
  const navRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const STICKY_TOP = 64 // matches top-16 (4rem)
    const update = () => {
      const h = navRef.current?.getBoundingClientRect().height || 0
      document.documentElement.style.setProperty('--settings-nav-offset', `${STICKY_TOP + h}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return (
    <div className="space-y-6">
      {/* Top navbar */}
      <div ref={navRef} className="sticky top-16 z-30 -mx-2 px-2 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="flex flex-wrap gap-2">
          {items.map(i => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({isActive}) => `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
