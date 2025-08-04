'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Ship, 
  Users, 
  DollarSign, 
  Wrench, 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Calculator,
  TrendingUp,
  Banknote
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kapal', href: '/kapal', icon: Ship },
  { name: 'ABK', href: '/abk', icon: Users },
  { 
    name: 'Keuangan', 
    href: '/keuangan', 
    icon: DollarSign,
    hasDropdown: true,
    subMenus: [
      { name: 'Hitung Gaji', href: '/keuangan/hitung-gaji', icon: Calculator },
      { name: 'Hitung Modal', href: '/keuangan/hitung-modal', icon: Banknote },
      { name: 'Hitung Keuntungan', href: '/keuangan/hitung-keuntungan', icon: TrendingUp },
    ]
  },
  { name: 'Maintenance', href: '/pemeliharaan', icon: Wrench },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({})
  const pathname = usePathname()

  const toggleDropdown = (itemName: string, e: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering the link
    e.preventDefault()
    e.stopPropagation()
    
    setDropdownOpen((prev: { [key: string]: boolean }) => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  const isSubMenuActive = (subMenus: any) => {
    if (!subMenus) return false
    return subMenus.some((subMenu: any) => pathname === subMenu.href)
  }

  const isParentActive = (item: any) => {
    if (item.hasDropdown) {
      return pathname === item.href || isSubMenuActive(item.subMenus)
    }
    return pathname === item.href
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Perikanan</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = isParentActive(item)
              const Icon = item.icon
              const hasDropdown = item.hasDropdown || false
              const isDropdownOpen = dropdownOpen[item.name] || false
              
              return (
                <div key={item.name}>
                  {/* Main navigation item */}
                  {hasDropdown ? (
                    <div className="relative">
                      <Link
                        href={item.href}
                        className={`
                          flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors w-full
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        <button
                          onClick={(e) => toggleDropdown(item.name, e)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          aria-label={`Toggle ${item.name} submenu`}
                        >
                          {isDropdownOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown submenu */}
                  {hasDropdown && isDropdownOpen && item.subMenus && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.subMenus.map((subMenu) => {
                        const SubIcon = subMenu.icon
                        const isSubActive = pathname === subMenu.href
                        
                        return (
                          <Link
                            key={subMenu.name}
                            href={subMenu.href}
                            className={`
                              flex items-center px-4 py-2 text-sm rounded-lg transition-colors
                              ${isSubActive 
                                ? 'bg-blue-100 text-blue-800 font-medium' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              }
                            `}
                            onClick={() => setIsOpen(false)}
                          >
                            <SubIcon className="mr-3 h-4 w-4" />
                            {subMenu.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}