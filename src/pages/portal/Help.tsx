
import React, { useState } from 'react';
import { Card } from '@mantine/core';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageCircle, Phone, Mail, ExternalLink, Video, FileText, Settings, Users, Calendar } from 'lucide-react';
import { LilleyGulchValidator } from '@/components/debug/LilleyGulchValidator';

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

      {/* Temporary debug component for Lilley Gulch validation */}
      <LilleyGulchValidator />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Getting Started
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
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
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
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
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">
              Review our terms of service and privacy policy.
            </p>
            <Button variant="link" className="justify-start">
              Terms of Service
            </Button>
            <Button variant="link" className="justify-start">
              Privacy Policy
            </Button>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">
              Manage your account settings, including profile information and billing details.
            </p>
            <Button variant="link" className="justify-start">
              Edit Profile
            </Button>
            <Button variant="link" className="justify-start">
              Change Password
            </Button>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">
              Learn how to manage users and permissions within your organization.
            </p>
            <Button variant="link" className="justify-start">
              Add New User
            </Button>
            <Button variant="link" className="justify-start">
              Edit User Permissions
            </Button>
          </Card.Section>
        </Card>

        <Card>
          <Card.Section className="space-y-1 p-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Class Scheduling
            </div>
          </Card.Section>
          <Card.Section className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">
              Get help with scheduling and managing your classes.
            </p>
            <Button variant="link" className="justify-start">
              Create a New Class
            </Button>
            <Button variant="link" className="justify-start">
              Edit Class Schedule
            </Button>
          </Card.Section>
        </Card>
      </div>

      <Card>
        <Card.Section className="p-4">
          <div className="font-medium">Contact Support</div>
          <Card.Section className="space-y-2 p-4">
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
          </Card.Section>
        </Card.Section>
      </Card>
    </div>
  );
};

export default HelpPage;
