import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import { formatDistanceToNow } from 'date-fns';

interface CommentData {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  author_name: string;
  children?: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  postId: number;
  onReplyAdded: () => void;
}

export const Comment = ({ comment, postId, onReplyAdded }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onReplyAdded();
  };

  return (
    <div className="flex space-x-3">
      <Avatar>
        <AvatarFallback>{comment.author_name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="font-semibold">{comment.author_name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </p>
        </div>
        <p className="mt-1 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
        <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={() => setShowReplyForm(!showReplyForm)}>
          Reply
        </Button>
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-6 space-y-6 border-l-2 border-border pl-4 md:pl-6">
            {comment.children.map(reply => (
              <Comment key={reply.id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};