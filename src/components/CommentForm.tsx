import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';

interface CommentFormProps {
  postId: number;
  parentId?: number | null;
  onCommentAdded: () => void;
  onCancel?: () => void;
  isReply?: boolean;
}

export const CommentForm = ({ postId, parentId = null, onCommentAdded, onCancel, isReply = false }: CommentFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content: content.trim(),
    });
    setLoading(false);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Comment added!');
      setContent('');
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? "Write a reply..." : "Add a comment..."}
        rows={isReply ? 2 : 4}
        required
      />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Posting...' : (isReply ? 'Post Reply' : 'Post Comment')}
        </Button>
        {isReply && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};