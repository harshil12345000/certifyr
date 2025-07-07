
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
    const handleAuthCallback = async () => {
      try {
        // Extract tokens from URL hash or search params
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));
        const searchParams = new URLSearchParams(location.search);
        
        const access_token = hashParams.get('access_token') || searchParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        console.log('Auth callback params:', { access_token: !!access_token, refresh_token: !!refresh_token, type });

        if (type === 'recovery' && access_token && refresh_token) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Failed to authenticate. Please request a new password reset link.');
          } else {
            console.log('Session set successfully:', data);
            setSessionSet(true);
          }
        } else {
          // Check if there's already an active session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setError('Authentication error. Please request a new password reset link.');
          } else if (session) {
            console.log('Found existing session');
            setSessionSet(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset link.');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [location.hash, location.search]);

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
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
      } else {
        setSuccess("Password updated successfully! Redirecting to sign in...");
        setTimeout(() => navigate("/auth"), 2000);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError("An unexpected error occurred. Please try again.");
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

  if (error && !sessionSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                <Button variant="link" type="button" onClick={() => navigate("/auth")}>
                  Back to Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
