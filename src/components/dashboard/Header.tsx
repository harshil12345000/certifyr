
import { useState } from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:block w-64">
        {/* Empty space to account for sidebar */}
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-2 md:w-72 px-0 mx- mx-[-210px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search templates, documents..." className="h-9 md:w-64 bg-transparent focus-visible:bg-white mx-[23px]" />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
