import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Comment {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  posts: {
    title: string;
    slug: string;
  }[] | null; // Corrected to be an array of objects
}

export const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, author_name, created_at, posts(title, slug)')
      .order('created_at', { ascending: false });
      
    if (error) {
      showError('Failed to fetch comments');
      console.error(error);
    } else {
      setComments(data as Comment[] || []);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async () => {
    if (!commentToDelete) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentToDelete.id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Comment deleted successfully!');
      fetchComments();
    }
    setIsAlertOpen(false);
    setCommentToDelete(null);
  };

  const openDeleteConfirm = (comment: Comment) => {
    setCommentToDelete(comment);
    setIsAlertOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Comments</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Comments</CardTitle>
          <CardDescription>View and delete comments from your readers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>In Response To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                  <TableCell>{comment.author_name}</TableCell>
                  <TableCell>
                    {comment.posts && comment.posts.length > 0 ? (
                      <Link to={`/posts/${comment.posts[0].slug}`} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline">{comment.posts[0].title}</Badge>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(comment)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};