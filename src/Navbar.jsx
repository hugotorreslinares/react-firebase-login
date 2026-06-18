import { Link } from 'react-router-dom';
import { logOut } from './firebase';
import logo from './assets/logo.svg';

function Navbar({ user }) {
  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 border-bottom">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="relative inline-flex items-center justify-center text-xl font-medium text-gray-900 group"
          style={{ minWidth: 120 }}
        >
          <span className="transition-opacity duration-300 ease-in-out group-hover:opacity-0">
            ThinkUp
          </span>
          <img
            src={logo}
            alt="ThinkUp"
            className="pointer-events-none absolute inset-0 mx-auto h-8 w-8 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
          />
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Inicio
          </Link>


          {user && (
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Mis Ideas
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-none"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-none hover:bg-gray-800 transition-colors uppercase"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
