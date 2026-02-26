import { Link } from 'react-router-dom';
import { logOut, signInWithGoogle } from './firebase';

function Navbar({ user }) {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-medium text-gray-900">
          MyApp
        </Link>
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Home
          </Link>
          
          {user && (
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
          )}
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
