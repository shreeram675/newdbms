import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold tracking-wider hover:text-gray-300">
                    DocVerify<span className="text-blue-400">Chain</span>
                </Link>

                <div className="space-x-6 flex items-center">
                    <Link to="/verifier" className="hover:text-blue-300 transition">Verify</Link>

                    {user ? (
                        <>
                            {user.role === 'uploader' && <Link to="/uploader" className="hover:text-blue-300">Dashboard</Link>}
                            {user.role === 'admin' && <Link to="/admin" className="hover:text-blue-300">Admin</Link>}

                            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-600">
                                <span className="text-sm text-gray-400">Hi, {user.name | "User"}</span>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 px-4 py-1.5 rounded text-sm hover:bg-red-700 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="px-4 py-2 hover:bg-gray-700 rounded transition">Login</Link>
                            <Link to="/signup" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
