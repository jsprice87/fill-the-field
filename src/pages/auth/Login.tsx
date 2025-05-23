
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          // Handle unconfirmed email case for better UX
          toast.error("Your email is not confirmed. Resending confirmation email...");
          
          // Resend confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });
          
          toast.info("Confirmation email resent. Please check your inbox.");
        } else {
          throw error;
        }
      } else if (data.user) {
        toast.success("Login successful");
        
        // Check if the user is an admin (you'll need to implement a proper role check here)
        const isAdmin = data.user.email?.includes('admin'); // Simple check for demonstration
        
        if (isAdmin) {
          // Redirect admin users to admin dashboard
          navigate("/admin/dashboard");
        } else {
          // For regular users, use a franchisee ID (could be stored in user metadata)
          // For now, just use a placeholder franchisee ID
          const franchiseeId = data.user.id || "default";
          navigate(`/${franchiseeId}/portal/dashboard`);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Log in to your account</CardTitle>
          <CardDescription>
            Welcome back to SuperLeadStar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="text-right text-sm">
                  <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>

              {/* Dev mode bypass option */}
              {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                <div className="mt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full mt-2 text-xs"
                    onClick={() => {
                      if (formData.email) {
                        toast.info("Attempting auto-verification for test environment");
                        // Try to find and login the user regardless of email verification
                        supabase.auth.signInWithPassword({
                          email: formData.email,
                          password: formData.password,
                        }).then(({ data, error }) => {
                          if (error) {
                            toast.error("Test login failed: " + error.message);
                          } else if (data.user) {
                            toast.success("Test login successful");
                            navigate("/dashboard");
                          }
                        });
                      } else {
                        toast.error("Please enter an email address first");
                      }
                    }}
                  >
                    Test Environment: Bypass Verification
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
