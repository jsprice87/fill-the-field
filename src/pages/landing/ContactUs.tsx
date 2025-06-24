
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MapPin, Globe } from 'lucide-react';

interface FranchiseeData {
  company_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  email: string;
}

interface FranchiseeSettings {
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
}

const ContactUs: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const [franchiseeData, setFranchiseeData] = useState<FranchiseeData | null>(null);
  const [franchiseeSettings, setFranchiseeSettings] = useState<FranchiseeSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (franchiseeSlug) {
      loadFranchiseeData();
    }
  }, [franchiseeSlug]);

  const loadFranchiseeData = async () => {
    try {
      // Get franchisee by slug
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('*')
        .eq('slug', franchiseeSlug)
        .single();

      if (franchiseeError || !franchisee) {
        console.error('Franchisee error:', franchiseeError);
        return;
      }

      setFranchiseeData(franchisee);

      // Get franchisee settings
      const { data: settings, error: settingsError } = await supabase
        .from('franchisee_settings')
        .select('*')
        .eq('franchisee_id', franchisee.id);

      if (!settingsError && settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);
        setFranchiseeSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error loading franchisee data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = franchiseeData?.company_name || 'Soccer Stars';
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link to={`/${franchiseeSlug}`} className="text-xl font-bold">{displayName}</Link>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeSlug}`} className="hover:underline">Home</Link>
            <Link to={`/${franchiseeSlug}/find-classes`} className="hover:underline">Find Classes</Link>
            <Link to={`/${franchiseeSlug}/contact`} className="hover:underline font-medium">Contact Us</Link>
            <Link to={`/${franchiseeSlug}/es`} className="hover:underline">Español</Link>
          </nav>
          <Link to={`/${franchiseeSlug}/free-trial`} className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
            Book Now
          </Link>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="name" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea id="message" rows={4} className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition w-full">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {franchiseeData?.address && (
                    <div>
                      <h3 className="font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </h3>
                      <p className="text-gray-600">
                        {franchiseeData.address}
                        {franchiseeData.city && franchiseeData.state && (
                          <><br />{franchiseeData.city}, {franchiseeData.state} {franchiseeData.zip}</>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {franchiseeData?.phone && (
                    <div>
                      <h3 className="font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </h3>
                      <p className="text-gray-600">{franchiseeData.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-gray-600">{franchiseeData?.email || 'contact@fillthefield.com'}</p>
                  </div>

                  {franchiseeSettings.website_url && (
                    <div>
                      <h3 className="font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </h3>
                      <a 
                        href={franchiseeSettings.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Visit our website
                      </a>
                    </div>
                  )}

                  {/* Social Links */}
                  {(franchiseeSettings.facebook_url || franchiseeSettings.instagram_url) && (
                    <div>
                      <h3 className="font-medium text-gray-700">Follow Us</h3>
                      <div className="flex gap-4 mt-2">
                        {franchiseeSettings.facebook_url && (
                          <a
                            href={franchiseeSettings.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Facebook
                          </a>
                        )}
                        {franchiseeSettings.instagram_url && (
                          <a
                            href={franchiseeSettings.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-bold mb-2">{displayName}</h3>
              <p className="text-gray-300">Making soccer fun for kids since 2005</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/${franchiseeSlug}`} className="text-gray-300 hover:text-white">Home</Link>
                <Link to={`/${franchiseeSlug}/find-classes`} className="text-gray-300 hover:text-white">Find Classes</Link>
                <Link to={`/${franchiseeSlug}/contact`} className="text-gray-300 hover:text-white">Contact Us</Link>
                <Link to={`/${franchiseeSlug}/free-trial`} className="text-gray-300 hover:text-white">Book a Class</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} {displayName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
