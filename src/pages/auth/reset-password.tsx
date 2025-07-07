import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function getTokenFromUrl(location: Location) {
  // Try query string first
  const params = new URLSearchParams(location.search);
  let access_token = params.get("access_token");
  let refresh_token = params.get("refresh_token");
  let type = params.get("type");

  // If not found, try hash fragment (Supabase sometimes uses this)
  if (!access_token || !refresh_token) {
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
      access_token = hashParams.get("access_token") || access_token;
      refresh_token = hashParams.get("refresh_token") || refresh_token;
      type = hashParams.get("type") || type;
    }
  }
  return { access_token, refresh_token, type };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true); // Start as true
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionSet, setSessionSet] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fix: getTokenFromUrl expects a DOM Location, but react-router's location is different.
    // We'll construct a compatible object for getTokenFromUrl.
    const domLocation = {
      search: location.search,
      hash: location.hash,
    } as Location;

    const { access_token, refresh_token, type } = getTokenFromUrl(domLocation);

    if (type === "recovery" && access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
            setLoading(false);
          } else {
            setSessionSet(true);
            setLoading(false);
          }
        });
    } else if (!access_token && !refresh_token && !type) {
      // If no params, assume user is already in a recovery session (e.g., page refresh)
      setSessionSet(true);
      setLoading(false);
    } else {
      setError("Auth session missing! Please use the link from your email.");
      setLoading(false);
    }
  }, [location.search, location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated! You can now sign in.");
        setTimeout(() => navigate("/auth"), 2000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md text-center text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md text-center text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!sessionSet) {
    return null; // Don't show form until session is set
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Set a New Password</CardTitle>
            <p className="text-gray-600 mt-2 text-sm">Enter your new password below.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <div className="text-center mt-4">
                <Button variant="link" type="button" onClick={() => navigate("/auth")}>Back to Sign In</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 