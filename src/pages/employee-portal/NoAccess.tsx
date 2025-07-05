import React from "react";
import { DoorOpen } from "lucide-react";

export default function NoAccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <DoorOpen className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-4 max-w-md text-center">
        You no longer have access to this organization's employee portal. If you
        believe this is a mistake, please contact your administrator.
      </p>
      <a href="/" className="text-primary font-medium underline">
        Return to Home
      </a>
    </div>
  );
}
