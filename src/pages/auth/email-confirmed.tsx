import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailConfirmed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Email Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-lg text-gray-700 py-6">
              Your email is confirmed!<br />
              You can now continue onboarding in your other tab.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 