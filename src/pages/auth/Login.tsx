
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, PasswordInput, Stack, Text, Group, Box, Anchor, Alert } from '@mantine/core';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSlugFromFranchiseeId } from "@/utils/slugUtils";

interface LoginProps {
  redirectAfter?: 'admin' | 'portal';
}

const Login = ({ redirectAfter = 'portal' }: LoginProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      const errorMsg = "Please enter both email and password";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        // Provide specific error feedback based on error type
        if (error.message.includes("Email not confirmed")) {
          toast.error("Your email is not confirmed. Resending confirmation email...");
          
          // Resend confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });
          
          toast.info("Confirmation email resent. Please check your inbox.");
        } else if (error.message.includes("Invalid login credentials")) {
          const errorMsg = "Invalid email or password. Please check your credentials and try again.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else if (error.message.includes("Email not found")) {
          const errorMsg = "No account found with this email address. Please check your email or create a new account.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else if (error.message.includes("Too many requests")) {
          const errorMsg = "Too many login attempts. Please wait a few minutes before trying again.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else if (error.message.includes("Invalid email")) {
          const errorMsg = "Please enter a valid email address.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else if (error.message.includes("Network error")) {
          const errorMsg = "Network error. Please check your connection and try again.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } else {
          // Fallback for other errors
          const errorMsg = error.message || "Login failed. Please check your credentials and try again.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
        setIsLoading(false);
        return;
      } else if (data.user) {
        setErrorMessage(""); // Clear any previous error messages
        toast.success("Login successful");
        
        // Determine redirect path based on redirectAfter prop
        const targetPath = redirectAfter === 'admin' ? '/admin/dashboard' : '/dashboard';
        
        // Check if the user is an admin (you'll need to implement a proper role check here)
        const isAdmin = data.user.email?.includes('admin'); // Simple check for demonstration
        
        if (redirectAfter === 'admin') {
          // Admin login requested
          navigate("/admin/dashboard");
        } else if (isAdmin) {
          // Regular login but user is admin
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
      // More specific error handling for unexpected errors
      if (error.name === 'AbortError') {
        toast.error("Login request was cancelled. Please try again.");
      } else if (error.message.includes('fetch')) {
        toast.error("Unable to connect to the server. Please check your internet connection.");
      } else {
        toast.error(error.message || "An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Log in to your account"
      subtitle="Welcome back to Fill The Field!"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {errorMessage && (
            <Alert color="red" title="Login Error">
              {errorMessage}
            </Alert>
          )}
          
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

      {redirectAfter !== 'admin' && (
        <Box mt="sm" ta="center">
          <Anchor component={Link} to="/admin/login">
            Login to Admin Portal
          </Anchor>
        </Box>
      )}
    </AuthLayout>
  );
};

export default Login;
