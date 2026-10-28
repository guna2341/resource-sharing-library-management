import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export function AppLayout({ children, breadcrumb }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Navigation with Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col"
            >
              <AppSidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Container */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Sticky App Header */}
        <AppHeader
          breadcrumb={breadcrumb}
          onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
        />

        {/* Page Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
