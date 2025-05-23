
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slugUtils";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    contactName: "",
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
    
    if (!formData.email || !formData.password || !formData.companyName || !formData.contactName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a URL-friendly slug from company name
      const baseSlug = generateSlug(formData.companyName);
      
      // Ensure slug is unique in the database
      const uniqueSlug = await ensureUniqueSlug(baseSlug);
      
      // 1. Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.companyName,
            contact_name: formData.contactName,
          },
        }
      });
      
      if (authError) throw authError;
      
      // Check if email confirmation is enabled in Supabase settings
      if (authData.user) {
        // Check if email is confirmed or confirmation isn't required
        if (authData.user.email_confirmed_at || authData.session) {
          // If email is confirmed or session exists, proceed with sign-in and franchisee creation
          try {
            // Create franchisee record with proper auth context
            const { error: franchiseeError } = await supabase
              .from("franchisees")
              .insert({
                user_id: authData.user.id,
                company_name: formData.companyName,
                contact_name: formData.contactName,
                email: formData.email,
                slug: uniqueSlug,
              });
              
            if (franchiseeError) {
              console.error("Franchisee creation error:", franchiseeError);
              toast.error("Account created but profile setup failed. Please contact support.");
              navigate("/login");
              return;
            }
            
            toast.success("Account created successfully!");
            navigate(`/${uniqueSlug}/portal/dashboard`);
          } catch (error) {
            console.error("Error creating franchisee:", error);
            toast.error("Account created but profile setup failed. Please try logging in.");
            navigate("/login");
          }
        } else {
          // For development/testing, try to sign in immediately to get proper auth context
          if (import.meta.env.DEV || window.location.hostname === 'localhost') {
            // Sign in the user to establish proper auth context
            try {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
              });
              
              if (signInError) {
                if (signInError.message.includes("Email not confirmed")) {
                  console.error("Sign in error after registration:", signInError);
                  toast.error("Please check your email to verify your account before logging in.");
                  
                  // Resend confirmation email
                  await supabase.auth.resend({
                    type: 'signup',
                    email: formData.email,
                  });
                  
                  toast.info("Verification email resent. Please check your inbox and spam folder.");
                } else {
                  console.error("Sign in error after registration:", signInError);
                  toast.error("Account created but sign-in failed. Please try logging in manually.");
                }
                navigate("/login");
                return;
              }
              
              if (signInData.user) {
                // Now create franchisee record with proper auth context
                const { error: franchiseeError } = await supabase
                  .from("franchisees")
                  .insert({
                    user_id: signInData.user.id,
                    company_name: formData.companyName,
                    contact_name: formData.contactName,
                    email: formData.email,
                    slug: uniqueSlug,
                  });
                  
                if (franchiseeError) {
                  console.error("Franchisee creation error:", franchiseeError);
                  toast.error("Account created but profile setup failed. Please contact support.");
                  navigate("/login");
                  return;
                }
                
                toast.success("Account created and logged in successfully!");
                navigate(`/${uniqueSlug}/portal/dashboard`);
                return;
              }
            } catch (error) {
              console.error("Sign-in error:", error);
              toast.error("Account created but auto-login failed. Please try logging in manually.");
              navigate("/login");
              return;
            }
          }
          
          // Production flow - email confirmation required
          toast.success("Registration successful! Please check your email to verify your account.");
          toast.info("You'll need to verify your email before logging in.");
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Get started with SuperLeadStar
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Your Business Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  placeholder="Your Name"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
