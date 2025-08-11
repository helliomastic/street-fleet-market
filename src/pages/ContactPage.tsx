
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Mail, MessageCircle } from 'lucide-react';
// Zod validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // 1) Store submission in DB
      const { error: dbError } = await supabase.from('contact_submissions').insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      });
      if (dbError) throw new Error(dbError.message);

      // 2) Send email via Edge Function
      const { error: fnError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        toast({
          variant: "destructive",
          title: "Message received, but email failed",
          description: "We saved your message. Our team will still review it shortly.",
        });
      } else {
        toast({
          title: "Message sent!",
          description: "Thanks for reaching out — we’ve received your message and emailed it to our team.",
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
      }

      form.reset();
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error Sending Message",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue flex items-center">
          <Mail className="mr-3 text-brand-orange" />
          Contact Us
        </h1>

        <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="mb-6 text-center">
            <MessageCircle className="mx-auto mb-4 text-brand-orange" size={48} />
            <p className="text-muted-foreground">
              Have a question or feedback? We'd love to hear from you!
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="What can we help you with?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your message..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-brand-blue" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
