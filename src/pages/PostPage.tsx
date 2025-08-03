import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface Post {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
  slug: string;
}

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { socialSharing } = useSettings();

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

  const shareUrl = window.location.href;
  const shareTitle = post?.title || 'Check out this tutorial!';

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
        break;
      default:
        break;
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

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
            <article className="max-w-3xl mx-auto"> {/* Added max-w-3xl and mx-auto here */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
              <p className="text-muted-foreground mb-8">
                Posted in {post.category} on {new Date(post.created_at).toLocaleDateString()}
              </p>
              {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />}
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
              {socialSharing.enabled && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-4">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Share this post:</span>
                  <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Share on Facebook</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </Button>
                </div>
              )}
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