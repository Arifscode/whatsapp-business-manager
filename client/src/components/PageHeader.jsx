import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';

export default function PageHeader({ title, showBack = false, showLogout = false }) {
  const navigate = useNavigate();

  function handleLogout() {
    if (confirm('Log out?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-600"
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        {showLogout && (
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
