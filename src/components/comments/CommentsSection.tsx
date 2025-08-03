import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface CommentData {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  profiles: Profile;
  children?: CommentData[];
}

export const CommentsSection = ({ postId }: { postId: number }) => {
  const { session, loading: authLoading } = useAuth();
  const location = useLocation();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      const commentsById: { [key: number]: CommentData } = {};
      (data || []).forEach(comment => {
        if (comment.profiles) { // Only process comments with a profile
          commentsById[comment.id] = { ...comment, children: [] };
        }
      });

      const rootComments: CommentData[] = [];
      (data || []).forEach(comment => {
        if (!comment.profiles) return; // Skip comments without a profile
        if (comment.parent_id && commentsById[comment.parent_id]) {
          commentsById[comment.parent_id].children?.push(commentsById[comment.id]);
        } else {
          rootComments.push(commentsById[comment.id]);
        }
      });
      setComments(rootComments);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleCommentAdded = () => {
    fetchComments();
  };

  const totalComments = (data: CommentData[]): number => {
    return data.reduce((acc, comment) => {
      return acc + 1 + (comment.children ? totalComments(comment.children) : 0);
    }, 0);
  };

  if (authLoading || loadingComments) {
    return (
      <div className="space-y-4 mt-12">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Comments ({totalComments(comments)})</h2>
      {session ? (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="p-4 border rounded-md bg-muted/50 text-center">
          <p className="text-muted-foreground">You must be logged in to comment.</p>
          <Link to="/auth" state={{ from: location }}>
            <Button className="mt-2">Login or Sign Up</Button>
          </Link>
        </div>
      )}
      <div className="mt-8 space-y-6">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} postId={postId} onReplyAdded={handleCommentAdded} />
        ))}
      </div>
    </div>
  );
};