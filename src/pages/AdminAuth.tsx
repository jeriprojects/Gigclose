import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/gigclose/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").min(1).max(255),
  password: z.string().min(1, "Required").max(72),
});

const AdminAuth = () => {
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/app/admin";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });

    if (!result.success) {
      toast({ 
        title: "Check your details", 
        description: result.error.issues[0].message, 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (signInError) {
        toast({ 
          title: "Sign in failed", 
          description: signInError.message, 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ 
          title: "Error", 
          description: "Failed to retrieve user information", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      // Verify admin status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        // Sign out immediately if not admin
        await supabase.auth.signOut();
        toast({ 
          title: "Access denied", 
          description: "You do not have admin privileges", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      toast({ 
        title: "Signed in successfully", 
        description: "Welcome back, admin" 
      });
      
      navigate(redirect);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  return (
    <div className="gig-grid-surface min-h-screen p-3">
      <header className="container relative z-10 flex h-16 items-center justify-between rounded-full border border-white/15 bg-[#020617] px-3 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.75)] sm:px-5">
        <Link to="/" className="rounded-full px-1 text-white">
          <Logo wordmarkClassName="text-white" />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm" className="hidden rounded-full px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex">Regular login</Button></Link>
          <Link to="/"><Button size="sm" className="rounded-full bg-white px-4 text-slate-950 hover:bg-cyan-50">Home</Button></Link>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-8">
      <Card className="gig-panel w-full max-w-md">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="gig-icon-tile mb-4 h-14 w-14">
              <Shield className="h-6 w-6" />
            </div>
            <Logo />
            <h1 className="text-2xl font-bold text-center mt-4">Admin Portal</h1>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Administrative access only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@gigclose.dev"
                required 
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                required 
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            If you are not an administrator, please use the{" "}
            <Link to="/auth" className="text-primary hover:underline">
              regular login
            </Link>
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
