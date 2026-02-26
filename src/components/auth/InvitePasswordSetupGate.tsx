import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface PasswordRequirementRow {
  must_set_password: boolean;
  password_set: boolean;
}

const isStrongEnough = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasMinLength && hasLetter && hasDigit;
};

export function InvitePasswordSetupGate() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mustSetPassword, setMustSetPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword],
  );
  const strongPassword = useMemo(() => isStrongEnough(password), [password]);

  useEffect(() => {
    let mounted = true;

    const checkRequirement = async () => {
      if (!user?.id) {
        if (mounted) {
          setMustSetPassword(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from("user_password_setup_requirements")
          .select("must_set_password, password_set")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to check password setup requirement:", error);
          if (mounted) {
            setMustSetPassword(false);
          }
          return;
        }

        const row = (data || null) as PasswordRequirementRow | null;
        if (mounted) {
          setMustSetPassword(Boolean(row?.must_set_password && !row?.password_set));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkRequirement();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!strongPassword) {
      toast({
        title: "Weak password",
        description: "Use at least 8 characters with letters and numbers.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        password,
      });
      if (updateAuthError) throw updateAuthError;

      const now = new Date().toISOString();
      const { error: persistError } = await (supabase as any)
        .from("user_password_setup_requirements")
        .upsert(
          {
            user_id: user.id,
            must_set_password: false,
            password_set: true,
            password_set_at: now,
            updated_at: now,
          },
          { onConflict: "user_id" },
        );
      if (persistError) throw persistError;

      setMustSetPassword(false);
      toast({
        title: "Password set",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to set password",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !mustSetPassword) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] bg-background/70 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>
            You must set and confirm your password before using the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-password">New Password</Label>
              <Input
                id="invite-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters, including letters and numbers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-confirm-password">Confirm Password</Label>
              <Input
                id="invite-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !strongPassword || !passwordsMatch}
            >
              {saving ? "Saving..." : "Set Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
