
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Team } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue flex items-center">
          <Team className="mr-3 text-brand-orange" />
          About Street Fleet Market
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Street Fleet Market is dedicated to revolutionizing the car buying and selling experience. 
                We provide a transparent, user-friendly platform that connects car enthusiasts, 
                dealers, and individual sellers with ease and confidence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Transparency in every transaction</li>
                <li>Empowering users with detailed vehicle information</li>
                <li>Creating a safe and trustworthy marketplace</li>
                <li>Supporting sustainable automotive practices</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-brand-blue">
            Why Choose Street Fleet Market?
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            We believe in simplifying the car buying and selling process. 
            Our platform offers comprehensive listings, secure messaging, 
            and a community-driven approach to automotive marketplace.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
