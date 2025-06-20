import React from 'react';
import { Link, useParams } from 'react-router-dom';

const FindClasses: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link to={`/${franchiseeId}/landing-page`} className="text-xl font-bold">Soccer Stars</Link>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">Home</Link>
            <Link to={`/${franchiseeId}/landing-page/find-classes`} className="hover:underline font-medium">Find Classes</Link>
            <Link to={`/${franchiseeId}/landing-page/contact-us`} className="hover:underline">Contact Us</Link>
            <Link to={`/${franchiseeId}/landing-page/spanish-speaking`} className="hover:underline">Español</Link>
          </nav>
          <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
            Book Now
          </Link>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Find Classes</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Search for Classes</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select id="location" className="w-full border-gray-300 rounded-md shadow-sm">
                  <option value="">All Locations</option>
                  <option>Downtown Community Center</option>
                  <option>Westside Park</option>
                  <option>Eastside Sports Complex</option>
                </select>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select id="age" className="w-full border-gray-300 rounded-md shadow-sm">
                  <option value="">All Ages</option>
                  <option>Ages 2-4</option>
                  <option>Ages 5-8</option>
                  <option>Ages 9-14</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition w-full">
                  Search
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No classes found. Please try different search criteria or check back later.</p>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-bold mb-2">Soccer Stars</h3>
              <p className="text-gray-300">Making soccer fun for kids since 2005</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/${franchiseeId}/landing-page`} className="text-gray-300 hover:text-white">Home</Link>
                <Link to={`/${franchiseeId}/landing-page/find-classes`} className="text-gray-300 hover:text-white">Find Classes</Link>
                <Link to={`/${franchiseeId}/landing-page/contact-us`} className="text-gray-300 hover:text-white">Contact Us</Link>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-gray-300 hover:text-white">Book a Class</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Soccer Stars. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FindClasses;
