import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("atlas_user");
    if (user) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Mock Login Success
    const name = email.split("@")[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    localStorage.setItem(
      "atlas_user",
      JSON.stringify({
        email,
        name: formattedName,
        createdAt: new Date().toISOString(),
      })
    );
    navigate({ to: "/" });
  };

  const handleSocialLogin = (provider: string) => {
    // Mock Social Login
    localStorage.setItem(
      "atlas_user",
      JSON.stringify({
        email: `${provider.toLowerCase()}@atlas.ai`,
        name: `${provider} Founder`,
        createdAt: new Date().toISOString(),
      })
    );
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono uppercase tracking-wider text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Powered by 8 AI Specialist Agents
          </span>
        </div>

        {/* Logo and Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105">
              ⌬
            </div>
            <span className="font-bold tracking-wider text-2xl text-white font-mono">ATLAS</span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
            Validate Your Startup Like a VC
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Sign in to access your startup analyses, AI agent reports, market insights, and saved projects.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Glassmorphic Form Card */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] py-8 px-4 shadow-2xl rounded-2xl sm:px-10 relative overflow-hidden">
          {/* Subtle card highlight border top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <a href="#" className="text-xs font-mono text-amber-500/80 hover:text-amber-400 transition">
                  Forgot Password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 bg-slate-950/50 border-white/[0.08] rounded text-amber-500 focus:ring-amber-500/50 accent-amber-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400 font-sans">
                  Remember Me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition duration-200 cursor-pointer transform hover:scale-[1.01]"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.05]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="px-2 bg-[#0E1424] text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition duration-150 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.64l2.4-2.4C17.335 1.558 14.935 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.77 0 9.58-4.06 9.58-9.75 0-.655-.07-1.3-.2-1.965H12.24Z" />
                </svg>
                Google
              </button>
              <button
                onClick={() => handleSocialLogin("GitHub")}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition duration-150 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.646.64.699 1.026 1.592 1.026 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>



        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-white/[0.03] flex justify-center gap-6 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="text-amber-500/80">✓</span> Secure Authentication
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500/80">✓</span> Private Startup Data
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500/80">✓</span> Investor-Grade Analysis
          </span>
        </div>
      </div>
    </div>
  );
}
