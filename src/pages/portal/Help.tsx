import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageCircle, Phone, Mail, ExternalLink, Video, FileText, Settings, Users, Calendar } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              New to the platform? Here are some helpful resources to get you started.
            </p>
            <Button variant="link" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Quick Start Guide
            </Button>
            <Button variant="link" className="justify-start">
              <Video className="h-4 w-4 mr-2" />
              Watch Video Tutorials
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Find answers to common questions about our product and services.
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Fill The Field?</AccordionTrigger>
                <AccordionContent>
                  Fill The Field is a platform designed to help activity businesses manage their trial classes and convert leads into paying customers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I create a landing page?</AccordionTrigger>
                <AccordionContent>
                  You can create a landing page by navigating to the "Landing Pages" section and using our drag-and-drop editor.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Review our terms of service and privacy policy.
            </p>
            <Button variant="link" className="justify-start">
              Terms of Service
            </Button>
            <Button variant="link" className="justify-start">
              Privacy Policy
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Manage your account settings, including profile information and billing details.
            </p>
            <Button variant="link" className="justify-start">
              Edit Profile
            </Button>
            <Button variant="link" className="justify-start">
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Learn how to manage users and permissions within your organization.
            </p>
            <Button variant="link" className="justify-start">
              Add New User
            </Button>
            <Button variant="link" className="justify-start">
              Edit User Permissions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Class Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Get help with scheduling and managing your classes.
            </p>
            <Button variant="link" className="justify-start">
              Create a New Class
            </Button>
            <Button variant="link" className="justify-start">
              Edit Class Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Need further assistance? Contact our support team.
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="ui-hover">
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </Button>
              <Button variant="outline" className="ui-hover">
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </Button>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default HelpPage;
