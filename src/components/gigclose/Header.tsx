import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/"><Logo size={56} /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors font-medium">How it works</a>
          <a href="#automatch" className="hover:text-foreground transition-colors font-medium">AutoMatch™</a>
          <a href="#trust" className="hover:text-foreground transition-colors font-medium">Trust</a>
          <Link to="/app/post" className="hover:text-foreground transition-colors font-medium">Post a job</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/app"><Button variant="ghost" size="sm">Open app</Button></Link>
              <Button size="sm" onClick={signOut} variant="outline">Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></Link>
              <Link to="/app">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-5 shadow-glow-sm">
                  Open app
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
