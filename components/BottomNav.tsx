import React from 'react';
import { Home, Library, BarChart2, ScanLine } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
    const isActive = currentPath === path;
    return (
      <button 
        onClick={() => navigate(path)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  // Don't show nav on scanner or review page to give full screen immersive feel
  if (currentPath === '/scan' || currentPath === '/review') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-darker/90 backdrop-blur-xl border-t border-zinc-800/50 flex items-center justify-around px-2 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      <NavItem icon={Home} label="Trang chủ" path="/" />
      <NavItem icon={Library} label="Thư viện" path="/library" />
      <div className="relative -top-5">
        <button 
          onClick={() => navigate('/scan')}
          className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-full p-4 shadow-lg shadow-emerald-900/50 transition-transform active:scale-90"
        >
          <ScanLine size={28} />
        </button>
      </div>
      <NavItem icon={BarChart2} label="Thống kê" path="/stats" />
    </div>
  );
};