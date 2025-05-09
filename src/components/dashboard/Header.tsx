import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export function Header() {
  const [notifications] = useState<{
    id: number;
    title: string;
    description: string;
    time: string;
  }[]>([{
    id: 1,
    title: 'Document Signed',
    description: 'Principal signed 5 NOC certificates',
    time: 'Just now'
  }, {
    id: 2,
    title: 'New Template Added',
    description: 'Embassy Attestation template is now available',
    time: '2 hours ago'
  }]);
  return <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:block w-64">
        {/* Empty space to account for sidebar */}
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-2 md:w-72 px-0 mx- mx-[-210px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search templates, documents..." className="h-9 md:w-64 bg-transparent focus-visible:bg-white" />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-600" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map(notification => <DropdownMenuItem key={notification.id} className="cursor-pointer p-3">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}