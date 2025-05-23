
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Confirmation: React.FC = () => {
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="rounded-full bg-green-100 p-3 flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-lg mb-6">Thank you for signing up for our soccer class. We're excited to have you join us!</p>
            <p className="text-gray-600 mb-8">
              A confirmation email with all the details has been sent to your email address. 
              If you don't see it, please check your spam folder.
            </p>
            <div className="space-y-4">
              <Link to={`/${franchiseeId}/landing-page`} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition inline-block">
                Return to Homepage
              </Link>
            </div>
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

export default Confirmation;
