import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !name.trim() || !email.trim()) {
      showError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      parent_id: parentId,
      content: content.trim(),
      author_name: name.trim(),
      author_email: email.trim(),
    });
    setLoading(false);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Comment added!');
      setContent('');
      if (!isReply) {
        setName('');
        setEmail('');
      }
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isReply && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" required />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`comment-${parentId || 'root'}`} className={isReply ? 'sr-only' : ''}>
          {isReply ? 'Your Reply' : 'Your Comment'}
        </Label>
        <Textarea
          id={`comment-${parentId || 'root'}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? "Write a reply..." : "Join the discussion..."}
          rows={isReply ? 3 : 4}
          required
        />
      </div>
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