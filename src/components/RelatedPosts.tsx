import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BlogPost } from './BlogPost';
import { Skeleton } from './ui/skeleton';

interface Post {
  id: number;
  title: string;
  summary: string;
  link: string;
  image_url: string;
  slug: string;
  created_at: string;
  categories: { name: string }[];
}

interface RelatedPostsProps {
  currentPostId: number;
  tags: { id: number; name: string }[];
}

export const RelatedPosts = ({ currentPostId, tags }: RelatedPostsProps) => {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (tags.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const tagIds = tags.map(t => t.id);

      const { data: postTags, error: postTagsError } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds)
        .neq('post_id', currentPostId)
        .limit(3);

      if (postTagsError || !postTags || postTags.length === 0) {
        setLoading(false);
        return;
      }

      const relatedPostIds = [...new Set(postTags.map(pt => pt.post_id))];

      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .in('id', relatedPostIds)
        .eq('status', 'published');

      if (error) {
        console.error('Error fetching related posts:', error);
      } else {
        const formattedPosts = (data || []).map(p => ({...p, link: `/posts/${p.slug}`})) as Post[];
        setRelatedPosts(formattedPosts);
      }
      setLoading(false);
    };

    fetchRelatedPosts();
  }, [currentPostId, tags]);

  if (loading) {
    return (
      <div className="mt-12 py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <BlogPost
            key={post.id}
            title={post.title}
            summary={post.summary}
            link={post.link}
            imageUrl={post.image_url}
            date={post.created_at}
            categories={post.categories}
          />
        ))}
      </div>
    </div>
  );
};