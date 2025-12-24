import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="md:hidden mr-4">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {mounted && isOpen && createPortal(
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <div className="fixed inset-y-0 left-0 z-[101] w-72 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
                        <div className="relative h-full">
                            <Sidebar onClose={() => setIsOpen(false)} />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg md:hidden z-50"
                                aria-label="Close Menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    )
}
