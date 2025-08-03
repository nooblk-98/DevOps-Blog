import { MountainIcon, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-foreground ${
      isActive ? "text-foreground" : "text-muted-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 items-center justify-between">
        {/* Left side: Logo and Mobile Menu Trigger */}
        <div className="flex items-center">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <MountainIcon className="h-6 w-6" />
                    <span>DevOps Zone</span>
                  </Link>
                  <NavLink
                    to="/"
                    className={({isActive}) => navLinkClasses({isActive})}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/tutorials"
                    className={({isActive}) => navLinkClasses({isActive})}
                  >
                    Tutorials
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({isActive}) => navLinkClasses({isActive})}
                  >
                    About
                  </NavLink>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <MountainIcon className="h-6 w-6" />
            <span className="font-bold">
              DevOps Zone
            </span>
          </Link>
        </div>

        {/* Centered Desktop Navigation */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/tutorials" className={navLinkClasses}>
              Tutorials
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
          </nav>
        </div>

        {/* Right side: Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};