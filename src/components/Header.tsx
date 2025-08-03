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
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <MountainIcon className="h-6 w-6" />
            <span className="font-bold">
              DevOps Zone
            </span>
          </Link>
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
        
        <div className="flex flex-1 items-center justify-between md:justify-end">
          {/* Mobile Menu */}
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};