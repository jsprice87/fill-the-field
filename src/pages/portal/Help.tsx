import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@mantine/core';
import { ExternalLink, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { PortalShell } from '@/layout/PortalShell';

const HelpPage: React.FC = () => {
  return (
    <PortalShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions about using our platform.
              </p>
              <Button variant="link" className="mt-4 pl-0">
                Browse FAQs
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn how to use our platform with detailed guides and tutorials.
              </p>
              <Button variant="link" className="mt-4 pl-0">
                View Documentation
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Watch video tutorials to get started and master our platform.
              </p>
              <Button variant="link" className="mt-4 pl-0">
                Watch Tutorials
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team for assistance.
              </p>
              <Button variant="link" className="mt-4 pl-0">
                Contact Us
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
};

export default HelpPage;
