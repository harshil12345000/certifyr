import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function EmailConfirmed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr Logo" className="mx-auto h-20 mb-2" />
            <div className="border-b border-gray-200 w-3/4 mx-auto mb-0" />
            <CardTitle className="pt-2 flex items-center justify-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              Email Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-lg text-gray-700 py-0">
              You can now continue onboarding in your other tab.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 