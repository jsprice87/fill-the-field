
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Starting registration for:", formData.email);
      
      // Register the user with metadata
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
      
      if (authError) {
        console.error("Registration error:", authError);
        throw authError;
      }
      
      console.log("Registration successful:", authData);
      
      if (authData.user) {
        // The database trigger will automatically create the franchisee record
        toast.success("Account created successfully!");
        
        // If user is immediately confirmed (development mode)
        if (authData.session) {
          console.log("User is immediately confirmed, redirecting to portal");
          
          // Wait a moment for the trigger to complete, then fetch the franchisee record
          setTimeout(async () => {
            try {
              const { data: franchisee, error: franchiseeError } = await supabase
                .from("franchisees")
                .select("slug")
                .eq("user_id", authData.user!.id)
                .single();
                
              if (franchiseeError || !franchisee) {
                console.error("Error fetching franchisee:", franchiseeError);
                toast.error("Account created but setup incomplete. Please try logging in.");
                navigate("/login");
                return;
              }
              
              console.log("Franchisee found:", franchisee);
              navigate(`/${franchisee.slug}/portal/dashboard`);
            } catch (error) {
              console.error("Error during post-registration setup:", error);
              toast.error("Account created but setup incomplete. Please try logging in.");
              navigate("/login");
            }
          }, 1000);
        } else {
          // Email confirmation required
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
