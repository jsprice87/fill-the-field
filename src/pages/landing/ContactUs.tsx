
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ContactUs: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link to={`/${franchiseeId}/landing-page`} className="text-xl font-bold">Soccer Stars</Link>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">Home</Link>
            <Link to={`/${franchiseeId}/landing-page/find-classes`} className="hover:underline">Find Classes</Link>
            <Link to={`/${franchiseeId}/landing-page/contact-us`} className="hover:underline font-medium">Contact Us</Link>
            <Link to={`/${franchiseeId}/landing-page/spanish-speaking`} className="hover:underline">Español</Link>
          </nav>
          <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
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
                  <div>
                    <h3 className="font-medium text-gray-700">Address</h3>
                    <p className="text-gray-600">123 Soccer Lane<br />Denver, CO 80202</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Phone</h3>
                    <p className="text-gray-600">(303) 555-1234</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-gray-600">info@soccerstars.com</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9am - 5pm<br />Saturday: 10am - 2pm<br />Sunday: Closed</p>
                  </div>
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

export default ContactUs;
