import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { showSuccess, showError } from '@/utils/toast';
import { CommentsSection } from '@/components/CommentsSection';
import { Session } from '@supabase/supabase-js';
import NotFound from './NotFound';

interface Post {
  id: number;
  title: string;
  description: string;
  summary: string;
  image_url: string;
  category: string;
  created_at: string;
  slug: string;
  status: 'draft' | 'published';
}

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { socialSharing } = useSettings();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSessionLoading(false);
    };
    getSession();
  }, []);

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

  useEffect(() => {
    if (post) {
      const codeBlocks = document.querySelectorAll<HTMLPreElement>('article pre');
      codeBlocks.forEach(pre => {
        if (pre.querySelector('.copy-code-button')) return;

        pre.style.position = 'relative';
        const code = pre.querySelector('code');
        if (!code) return;

        const button = document.createElement('button');
        button.className = 'copy-code-button absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors';
        button.setAttribute('aria-label', 'Copy code to clipboard');

        const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`;
        const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        
        button.innerHTML = copyIconSVG;

        button.addEventListener('click', () => {
          navigator.clipboard.writeText(code.innerText)
            .then(() => {
              button.innerHTML = checkIconSVG;
              showSuccess('Copied to clipboard!');
              setTimeout(() => {
                button.innerHTML = copyIconSVG;
              }, 2000);
            })
            .catch(err => {
              showError('Failed to copy code.');
              console.error('Failed to copy code:', err);
            });
        });

        pre.appendChild(button);
      });
    }
  }, [post]);

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

  if (loading || sessionLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 py-12 md:py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post || (post.status === 'draft' && !session)) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <article className="max-w-3xl mx-auto">
            {post.status === 'draft' && session && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-md" role="alert">
                <p className="font-bold">Draft Preview</p>
                <p>This is a draft and is not visible to the public.</p>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
            <p className="text-muted-foreground mb-8">
              Posted in {post.category} on {new Date(post.created_at).toLocaleDateString()}
            </p>
            {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />}
            
            {post.summary && (
              <p className="text-xl italic text-muted-foreground my-8 border-l-4 border-border pl-4">
                {post.summary}
              </p>
            )}

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
          <div className="max-w-3xl mx-auto">
            <CommentsSection postId={post.id} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostPage;