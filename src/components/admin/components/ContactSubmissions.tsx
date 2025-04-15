
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, Search, Mail, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
      setFilteredSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
      setError('Failed to load contact submissions');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact submissions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSubmissions(submissions.filter(submission => submission.id !== id));
      setFilteredSubmissions(filteredSubmissions.filter(submission => submission.id !== id));
      
      toast({
        title: "Submission deleted",
        description: "The contact submission has been deleted successfully.",
      });
    } catch (err) {
      console.error('Error deleting submission:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the submission",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubmissions();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Contact submissions have been refreshed",
    });
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubmissions(submissions);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = submissions.filter(
        submission =>
          submission.name.toLowerCase().includes(lowercasedSearch) ||
          submission.email.toLowerCase().includes(lowercasedSearch) ||
          submission.subject.toLowerCase().includes(lowercasedSearch) ||
          submission.message.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredSubmissions(filtered);
    }
  }, [searchTerm, submissions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact Form Submissions</CardTitle>
            <CardDescription>
              View all contact form submissions from users
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-muted-foreground text-center py-12 border rounded-md">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center">
                <Mail className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>No contact submissions found</p>
              </div>
            ) : (
              <p>No submissions match your search</p>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell className="underline text-blue-600">
                      <a href={`mailto:${submission.email}`}>{submission.email}</a>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.subject}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate hidden md:table-cell">
                      {submission.message}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(submission.id)}
                        title="Delete submission"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>Total submissions: {submissions.length}</div>
        {filteredSubmissions.length !== submissions.length && (
          <div>Showing {filteredSubmissions.length} of {submissions.length}</div>
        )}
      </CardFooter>
    </Card>
  );
};
