import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionSet, setSessionSet] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function handleSession() {
      setLoading(true);
      setError("");
      // Support both query params and hash fragments
      const searchParams = new URLSearchParams(location.search);
      let access_token = searchParams.get("access_token");
      let refresh_token = searchParams.get("refresh_token");
      let type = searchParams.get("type");
      let token_hash = searchParams.get("token_hash");

      // If not in query, check hash fragment
      if (!access_token || !refresh_token) {
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, "?"));
          access_token = hashParams.get("access_token") || access_token;
          refresh_token = hashParams.get("refresh_token") || refresh_token;
          type = hashParams.get("type") || type;
          token_hash = hashParams.get("token_hash") || token_hash;
        }
      }

      // 1. Try access_token/refresh_token (default Supabase flow)
      if (type === "recovery" && access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          setError("Failed to set session: " + error.message);
        } else {
          setSessionSet(true);
        }
        setLoading(false);
        return;
      }

      // 2. Try token_hash + type (custom email template flow)
      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'recovery' });
        if (error) {
          setError("Failed to verify OTP: " + error.message);
        } else if (data.session) {
          setSessionSet(true);
        } else {
          setError("No session returned from OTP verification.");
        }
        setLoading(false);
        return;
      }

      // 3. If no params, assume user is already in a recovery session (e.g., page refresh)
      if (!access_token && !refresh_token && !token_hash && !type) {
        setSessionSet(true);
        setLoading(false);
        return;
      }

      setError("Auth session missing! Please use the link from your email.");
      setLoading(false);
    }
    handleSession();
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
    return null;
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