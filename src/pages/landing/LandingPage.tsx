
import React from 'react';
import { Link, useParams } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { franchiseeId } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Soccer Stars</h1>
          <nav className="hidden md:flex space-x-4">
            <Link to={`/${franchiseeId}/landing-page`} className="hover:underline">Home</Link>
            <Link to={`/${franchiseeId}/landing-page/find-classes`} className="hover:underline">Find Classes</Link>
            <Link to={`/${franchiseeId}/landing-page/contact-us`} className="hover:underline">Contact Us</Link>
            <Link to={`/${franchiseeId}/landing-page/spanish-speaking`} className="hover:underline">Español</Link>
          </nav>
          <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
            Book Now
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="bg-indigo-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Learn Soccer with the Stars!</h2>
            <p className="text-xl mb-8">Fun and engaging soccer classes for children of all ages.</p>
            <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition text-lg">
              Sign Up For a Class
            </Link>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Programs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Parent & Me</h3>
                <p className="text-gray-600 mb-4">Introduction to soccer basics for ages 12-24 months. Focus on motor skills and fun.</p>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-indigo-600 hover:underline">Learn more</Link>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-3">Super Soccer Stars</h3>
                <p className="text-gray-600 mb-4">Skill-building program for ages 2-10+. Technique and teamwork focus.</p>
                <Link to={`/${franchiseeId}/landing-page/book-a-class`} className="text-indigo-600 hover:underline">Learn more</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-bold mb-2">Soccer Stars</h3>
              <p className="text-gray-300">Making soccer fun for kids since 2000</p>
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

export default LandingPage;
