import { MountainIcon } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 md:px-8">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MountainIcon className="h-6 w-6" />
          <span className="text-xl font-bold">DevOps Zone</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link to="/tutorials" className="hover:text-gray-400">
            Tutorials
          </Link>
          <Link to="/about" className="hover:text-gray-400">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};