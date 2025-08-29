import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPost } from "@/components/BlogPost";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/SettingsContext";
import { Link } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  description: string;
  summary: string;
  link: string;
  image_url: string;
  slug: string;
  created_at: string;
  is_pinned: boolean;
  categories: { name: string }[];
}

const Index = () => {
  const { banner: bannerSettings } = useSettings();
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);

      const { data: pinnedData, error: pinnedError } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('is_pinned', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (pinnedError) console.error('Error fetching pinned posts:', pinnedError);
      
      const formattedPinned = (pinnedData || []).map(p => ({...p, link: `/posts/${p.slug}`}));
      setPinnedPosts(formattedPinned as Post[]);

      const { data: recentData, error: recentError } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(9);

      if (recentError) console.error('Error fetching recent posts:', recentError);
      
      const formattedRecent = (recentData || []).map(p => ({...p, link: `/posts/${p.slug}`}));
      setRecentPosts(formattedRecent as Post[]);

      setLoadingPosts(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <section
          className="relative py-20 md:py-32 bg-cover bg-center"
          style={{ backgroundImage: `url('${bannerSettings?.image_url || ''}')` }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative container mx-auto px-6 md:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white" dangerouslySetInnerHTML={{ __html: bannerSettings?.title || 'Welcome' }} />
              <div className="mt-4 text-lg text-gray-200" dangerouslySetInnerHTML={{ __html: bannerSettings?.subtitle || '' }} />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6 md:px-8">
            {loadingPosts ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
              </div>
            ) : (
              <>
                {pinnedPosts.length > 0 && (
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Pinned Posts
                      </h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {pinnedPosts.map((post) => (
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
                )}

                {recentPosts.length > 0 && (
                  <div>
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Recent Posts
                      </h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {recentPosts.map((post) => (
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
                    <div className="text-center mt-8">
                      <Link to="/posts">
                        <Button>View All Posts</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {pinnedPosts.length === 0 && recentPosts.length === 0 && (
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No posts found.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
