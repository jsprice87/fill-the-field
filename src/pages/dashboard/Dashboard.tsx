
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Calendar } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Typography Hierarchy */}
      <div className="space-y-2">
        <h1 className="text-h1 text-gray-900 dark:text-gray-50">Fill The Field Dashboard</h1>
        <p className="text-body-lg text-muted-foreground">Fast Funnels for Free Trials - Your overview at a glance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium text-gray-700 dark:text-gray-300">Quick Stats</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-h2 font-bold text-gray-900 dark:text-gray-50">1,234</div>
            <p className="text-body-sm text-muted-foreground">Total leads this month</p>
            <div className="space-y-1">
              <h4 className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Performance Metrics</h4>
              <ul className="space-y-1 text-body-sm text-gray-700 dark:text-gray-300">
                <li>• Conversion rate: 12%</li>
                <li>• Average response time: 2.3 hours</li>
                <li>• Customer satisfaction: 4.8/5</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium text-gray-700 dark:text-gray-300">Recent Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-h2 font-bold text-gray-900 dark:text-gray-50">42</div>
            <p className="text-body-sm text-muted-foreground">New leads today</p>
            <div className="space-y-2">
              <h4 className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Latest Actions</h4>
              <div className="space-y-2">
                <div className="text-body-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-50">John Smith</span>
                  <span className="text-gray-600 dark:text-gray-400"> booked a trial class</span>
                </div>
                <div className="text-body-sm">
                  <span className="font-medium text-gray-900 dark:text-gray-50">Sarah Johnson</span>
                  <span className="text-gray-600 dark:text-gray-400"> completed registration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium text-gray-700 dark:text-gray-300">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-h2 font-bold text-gray-900 dark:text-gray-50">8</div>
            <p className="text-body-sm text-muted-foreground">Classes this week</p>
            <div className="space-y-2">
              <h4 className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Important Updates</h4>
              <div className="space-y-1">
                <p className="text-body-sm text-gray-700 dark:text-gray-300">
                  New booking system update available
                </p>
                <p className="text-body-sm text-gray-700 dark:text-gray-300">
                  Staff training scheduled for Friday
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-h3 text-gray-900 dark:text-gray-50">Typography Showcase</CardTitle>
            <p className="text-body-sm text-muted-foreground">
              Demonstrating our design system typography scale
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-h2 text-gray-900 dark:text-gray-50">Heading Level 2</h2>
              <h3 className="text-h3 text-gray-900 dark:text-gray-50">Heading Level 3</h3>
              <p className="text-body-lg text-gray-700 dark:text-gray-300">
                This is body large text. It's used for important content and provides good readability.
              </p>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                This is body small text. Perfect for secondary information and captions.
              </p>
              <code className="text-code bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                Code text example
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h3 text-gray-900 dark:text-gray-50">System Status</CardTitle>
            <p className="text-body-sm text-muted-foreground">
              All systems operational
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Lead Processing</span>
                <span className="text-body-sm text-success-500 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Booking System</span>
                <span className="text-body-sm text-success-500 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-lg font-medium text-gray-900 dark:text-gray-50">Email Notifications</span>
                <span className="text-body-sm text-warning-500 font-medium">Maintenance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
