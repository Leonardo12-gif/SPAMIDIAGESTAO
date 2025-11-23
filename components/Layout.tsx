import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  Wallet, 
  Printer, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useStore } from '../services/store';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budgets', label: 'Orçamentos', icon: FilePlus },
    { id: 'finance', label: 'Financeiro', icon: Wallet },
    { id: 'production', label: 'Produção', icon: Printer },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Frezza<span className="text-primary">Gestão</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 shadow-lg flex items-center justify-center">
             <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Spamídia</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Gestão Empresarial</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {settings.apiKey && (
            <div className="absolute bottom-20 left-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider">IA Ativada</span>
                </div>
                <p className="text-xs text-indigo-100 opacity-90">Monitoramento inteligente ligado.</p>
            </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          {children}
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 w-full py-4 text-center text-sm text-gray-400 bg-gray-50 border-t border-gray-200">
           Sistema Desenvolvido por <span className="font-semibold text-gray-600">Frezza Marketing</span>
        </footer>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;