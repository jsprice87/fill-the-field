import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, PasswordInput, Stack, Text } from '@mantine/core';
import { AuthLayout } from '@/components/auth/AuthLayout';
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

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    <AuthLayout 
      title="Create your account"
      subtitle="Get started with SuperLeadStar"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="name@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email')(e.target.value)}
            required
          />
          
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password')(e.target.value)}
            required
          />
          
          <TextInput
            label="Company Name"
            placeholder="Your Business Name"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName')(e.target.value)}
            required
          />
          
          <TextInput
            label="Contact Name"
            placeholder="Your Name"
            value={formData.contactName}
            onChange={(e) => handleChange('contactName')(e.target.value)}
            required
          />
          
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </Stack>
      </form>
      
      <Text ta="center" size="sm" c="dimmed">
        Already have an account?{" "}
        <Text 
          component={Link} 
          to="/login"
          fw={500}
          style={{ textDecoration: 'none', color: 'var(--mantine-color-blue-6)' }}
        >
          Log in
        </Text>
      </Text>
    </AuthLayout>
  );
};

export default Register;
