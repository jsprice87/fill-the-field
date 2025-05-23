
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSlugFromFranchiseeId, generateSlug, ensureUniqueSlug } from "@/utils/slugUtils";

// Define dummy franchisee accounts
const dummyFranchisees = [
  {
    email: "franchisee1@example.com",
    password: "password123",
    id: "franchise-001",
    name: "South Denver Soccer Stars"
  },
  {
    email: "franchisee2@example.com",
    password: "password123",
    id: "franchise-002",
    name: "North Seattle Soccer Club"
  },
  {
    email: "franchisee3@example.com",
    password: "password123",
    id: "franchise-003",
    name: "East Austin Athletics"
  }
];

// Define admin account
const adminAccount = {
  email: "admin@superleadstar.com",
  password: "admin123"
};

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
          // For regular users, get the slug from the franchisee table
          const slug = await getSlugFromFranchiseeId(data.user.id);
          
          if (slug) {
            // If slug exists, use it in the URL
            navigate(`/${slug}/portal/dashboard`);
          } else {
            // If no slug exists (should be rare), create a temporary one
            // and redirect to using the user ID with a notice
            toast.warning("Missing profile information. Please update your profile.");
            navigate(`/${data.user.id}/portal/dashboard`);
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create real test accounts and login
  const createAndLoginTestUser = async (userType: 'admin' | 'franchisee1' | 'franchisee2' | 'franchisee3') => {
    setIsLoading(true);
    
    try {
      if (userType === 'admin') {
        // Try to login first, if it fails, create the account
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: adminAccount.email,
          password: adminAccount.password,
        });
        
        if (loginError && loginError.message.includes('Invalid login credentials')) {
          // Create admin account
          console.log("Creating admin account...");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminAccount.email,
            password: adminAccount.password,
            options: {
              data: {
                role: 'admin'
              }
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          toast.success("Admin account created and logged in");
          setFormData({
            email: adminAccount.email,
            password: adminAccount.password,
          });
          navigate("/admin/dashboard");
        } else if (loginData.user) {
          toast.success("Logged in as Admin");
          setFormData({
            email: adminAccount.email,
            password: adminAccount.password,
          });
          navigate("/admin/dashboard");
        }
      } else {
        const franchiseeIndex = parseInt(userType.replace('franchisee', '')) - 1;
        if (franchiseeIndex >= 0 && franchiseeIndex < dummyFranchisees.length) {
          const franchisee = dummyFranchisees[franchiseeIndex];
          
          // Try to login first, if it fails, create the account
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: franchisee.email,
            password: franchisee.password,
          });
          
          if (loginError && loginError.message.includes('Invalid login credentials')) {
            // Create franchisee account
            console.log(`Creating franchisee account for ${franchisee.name}...`);
            
            // Generate a URL-friendly slug from company name
            const baseSlug = generateSlug(franchisee.name);
            
            // Ensure slug is unique in the database
            const uniqueSlug = await ensureUniqueSlug(baseSlug);
            
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: franchisee.email,
              password: franchisee.password,
              options: {
                data: {
                  company_name: franchisee.name,
                  contact_name: franchisee.name,
                  role: 'franchisee'
                }
              }
            });
            
            if (signUpError) {
              throw signUpError;
            }
            
            // After successful signup, create franchisee record
            if (signUpData.user) {
              console.log(`Creating franchisee record for user ${signUpData.user.id}...`);
              const { error: franchiseeError } = await supabase
                .from("franchisees")
                .insert({
                  user_id: signUpData.user.id,
                  company_name: franchisee.name,
                  contact_name: franchisee.name,
                  email: franchisee.email,
                  slug: uniqueSlug,
                });
                
              if (franchiseeError) {
                console.error("Error creating franchisee record:", franchiseeError);
              }
            }
            
            toast.success(`${franchisee.name} account created and logged in`);
            setFormData({
              email: franchisee.email,
              password: franchisee.password,
            });
            
            // Navigate using the slug
            navigate(`/${uniqueSlug}/portal/dashboard`);
          } else if (loginData.user) {
            toast.success(`Logged in as ${franchisee.name}`);
            setFormData({
              email: franchisee.email,
              password: franchisee.password,
            });
            
            // Get the slug for the user
            const slug = await getSlugFromFranchiseeId(loginData.user.id);
            
            if (slug) {
              navigate(`/${slug}/portal/dashboard`);
            } else {
              navigate(`/${loginData.user.id}/portal/dashboard`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Test account creation/login error:", error);
      toast.error(`Error: ${error.message}`);
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

              {/* Test Environment: Quick Access Buttons */}
              {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500 text-center mb-2">Test Environment: Create/Login Test Accounts</div>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => createAndLoginTestUser('admin')}
                    disabled={isLoading}
                  >
                    Create/Login as Admin
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {dummyFranchisees.map((franchisee, index) => (
                      <Button 
                        key={index}
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => createAndLoginTestUser(`franchisee${index + 1}` as any)}
                        disabled={isLoading}
                      >
                        Franchisee {index + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="text-xs text-center text-gray-500 mt-1">
                    <p>Test accounts (will be created if they don't exist):</p>
                    {dummyFranchisees.map((f, i) => (
                      <p key={i} className="text-[10px]">{f.name}: {f.email}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/create-account" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
