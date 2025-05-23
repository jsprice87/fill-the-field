
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BookClass: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link to={`/${franchiseeId}/landing-page`} className="text-xl font-bold">Soccer Stars</Link>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">Home</Link>
            <Link to={`/${franchiseeId}/landing-page/find-classes`} className="hover:underline">Find Classes</Link>
            <Link to={`/${franchiseeId}/landing-page/contact-us`} className="hover:underline">Contact Us</Link>
            <Link to={`/${franchiseeId}/landing-page/spanish-speaking`} className="hover:underline">Español</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Book a Class</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Parent/Guardian Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" id="firstName" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" id="lastName" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" className="w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" id="phone" className="w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Child Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="childFirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" id="childFirstName" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="childLastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" id="childLastName" className="w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <select id="age" className="w-full border-gray-300 rounded-md shadow-sm">
                      <option value="">Select age</option>
                      {Array.from({ length: 13 }, (_, i) => i + 2).map((age) => (
                        <option key={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Select a Program</h2>
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select id="program" className="w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Select a program</option>
                    <option>Toddler Soccer (Ages 2-4)</option>
                    <option>Youth Development (Ages 5-8)</option>
                    <option>Advanced Training (Ages 9-14)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select id="location" className="w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Select a location</option>
                    <option>Downtown Community Center</option>
                    <option>Westside Park</option>
                    <option>Eastside Sports Complex</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to={`/${franchiseeId}/landing-page/confirmation`} className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition w-full block text-center">
                  Continue to Booking
                </Link>
              </div>
            </form>
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

export default BookClass;
