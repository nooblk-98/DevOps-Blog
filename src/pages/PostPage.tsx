import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : post ? (
            <article>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
              <p className="text-muted-foreground mb-8">
                Posted in {post.category} on {new Date(post.created_at).toLocaleDateString()}
              </p>
              {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />}
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            </article>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">Post not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostPage;