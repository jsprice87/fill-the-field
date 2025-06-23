
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, PasswordInput, Stack, Text, Group } from '@mantine/core';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSlugFromFranchiseeId } from "@/utils/slugUtils";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
          // For regular users, the ProtectedRoute will handle profile creation
          // and the safety net will ensure they have a franchisee record
          
          // Try to get the slug, but don't block on it since the safety net will handle it
          try {
            const slug = await getSlugFromFranchiseeId(data.user.id);
            
            if (slug) {
              navigate(`/${slug}/portal/dashboard`);
            } else {
              // Use a temporary redirect, the safety net will create the profile
              navigate(`/temp-redirect/portal/dashboard`);
            }
          } catch (error) {
            console.error('Error getting slug during login:', error);
            // Fallback to a safe route, the safety net will handle profile creation
            navigate(`/profile-setup/portal/dashboard`);
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

  return (
    <AuthLayout 
      title="Log in to your account"
      subtitle="Welcome back to SuperLeadStar"
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
          
          <Group justify="flex-end">
            <Text 
              component={Link} 
              to="/forgot-password" 
              size="sm"
              style={{ textDecoration: 'none', color: 'var(--mantine-color-blue-6)' }}
            >
              Forgot password?
            </Text>
          </Group>
          
          <Button type="submit" fullWidth loading={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </Stack>
      </form>
      
      <Text ta="center" size="sm" c="dimmed">
        Don't have an account?{" "}
        <Text 
          component={Link} 
          to="/create-account"
          fw={500}
          style={{ textDecoration: 'none', color: 'var(--mantine-color-blue-6)' }}
        >
          Sign up
        </Text>
      </Text>
    </AuthLayout>
  );
};

export default Login;
