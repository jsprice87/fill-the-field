import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextInput, PasswordInput, Stack, Text, Group, Divider } from '@mantine/core';
import { AuthLayout } from '@/components/auth/AuthLayout';
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

          {/* Test Environment: Quick Access Buttons */}
          {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
            <>
              <Divider label="Test Environment" labelPosition="center" />
              
              <Text size="xs" c="dimmed" ta="center">
                Create/Login Test Accounts
              </Text>
              
              <Button 
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => createAndLoginTestUser('admin')}
                disabled={isLoading}
              >
                Create/Login as Admin
              </Button>
              
              <Group grow>
                {dummyFranchisees.map((franchisee, index) => (
                  <Button 
                    key={index}
                    variant="outline"
                    size="xs"
                    onClick={() => createAndLoginTestUser(`franchisee${index + 1}` as any)}
                    disabled={isLoading}
                  >
                    Franchisee {index + 1}
                  </Button>
                ))}
              </Group>
              
              <Stack gap="xs">
                <Text size="xs" ta="center" c="dimmed">
                  Test accounts (will be created if they don't exist):
                </Text>
                {dummyFranchisees.map((f, i) => (
                  <Text key={i} size="10px" ta="center" c="dimmed">
                    {f.name}: {f.email}
                  </Text>
                ))}
              </Stack>
            </>
          )}
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
