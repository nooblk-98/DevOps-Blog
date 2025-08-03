import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentData {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  author_name: string;
  children?: CommentData[];
}

export const CommentsSection = ({ postId }: { postId: number }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      const commentsById: { [key: number]: CommentData } = {};
      (data || []).forEach(comment => {
        commentsById[comment.id] = { ...comment, children: [] };
      });

      const rootComments: CommentData[] = [];
      (data || []).forEach(comment => {
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

  return (
    <div className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Leave a Comment</h2>
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      
      <div className="mt-12 space-y-8">
        <h3 className="text-xl font-bold">
          Comments ({loadingComments ? '...' : totalComments(comments)})
        </h3>
        {loadingComments ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <Comment key={comment.id} comment={comment} postId={postId} onReplyAdded={handleCommentAdded} />
          ))
        ) : (
          <p className="text-muted-foreground">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
};