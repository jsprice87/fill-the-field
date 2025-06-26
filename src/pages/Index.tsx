import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@mantine/core';
import { Button } from '@mantine/core';
import { Sparkles, ArrowRight, Target, Users, BarChart3, Globe, Calendar } from 'lucide-react';
import { Link } from "react-router-dom";
import { Text } from "@mantine/core";

const Index = () => {
  return <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-50 shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img alt="Fill The Field - Fast Funnels for Free Trials" className="h-28 w-auto max-w-[900px]" src="/lovable-uploads/a15870a7-8e97-44b0-8092-c94bf95e2423.png" />
          </div>
          <div className="flex items-center gap-4">
            
            <Link to="/login" className="flex items-center h-full text-gray-600 hover:text-indigo-600">
              Login
            </Link>
            <Link to="/register">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img alt="Fill The Field Shield" className="h-44 w-auto mx-auto mb-6" src="/lovable-uploads/f91d8524-d966-4fa4-9aca-8521b2603b51.png" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fill Your Trial Classes and Convert More Customers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The all-in-one platform for activity businesses to create custom landing pages,
            automate trial class bookings, and convert more leads into paying customers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      

      {/* Pricing CTA Section */}
      <section className="container mx-auto px-4 py-16 bg-slate-50">
        <div className="rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden bg-slate-400">
          <div className="absolute top-4 right-4 opacity-20">
            
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Fill The Field?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate-100">Join the probably around 3 or 4 (super good looking and popular) business owners who are filling their classes and growing their customer base with our fast funnels for free trials.</p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <img alt="Fill The Field - Fast Funnels for Free Trials" src="/lovable-uploads/db07ebae-bd0f-4203-9da2-dba6240585b9.png" className="h-auto w-auto mx-auto mb-4 max-w-[600px]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Guides</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">© {new Date().getFullYear()} Fill The Field. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};

export default Index;
