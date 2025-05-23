
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center mb-8">
        <Link to={`/${franchiseeId}/portal`} className="text-indigo-600 hover:text-indigo-800 mr-2">
          &larr; Back to Portal
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              Edit Profile
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="bg-indigo-100 text-indigo-700 rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold">
                JD
              </div>
              <div>
                <p className="text-xl font-medium">John Doe</p>
                <p className="text-gray-500">john@example.com</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="font-medium text-lg mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p>Soccer Stars Franchise</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p>May 2025</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="font-medium text-lg mb-4">Security</h2>
              <button className="text-indigo-600 hover:text-indigo-800">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
