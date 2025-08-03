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
  category: string;
  slug: string;
  created_at: string;
}

const Index = () => {
  const { banner: bannerSettings } = useSettings();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(9); // Fetch only the 9 most recent posts

      if (error) {
        console.error('Error fetching recent posts:', error);
      } else {
        const formattedPosts = (data || []).map(p => ({...p, link: `/tutorials/${p.slug}`}));
        setRecentPosts(formattedPosts);
      }
      setLoadingPosts(false);
    };
    fetchRecentPosts();
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
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {bannerSettings?.title || 'Welcome'}
              </h1>
              <p className="mt-4 text-lg text-gray-200">
                {bannerSettings?.subtitle || ''}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recent Tutorials
              </h2>
            </div>
            {loadingPosts ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {recentPosts.map((post) => (
                  <BlogPost
                    key={post.id}
                    title={post.title}
                    summary={post.summary}
                    link={post.link}
                    imageUrl={post.image_url}
                    date={post.created_at}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No recent tutorials found.
              </p>
            )}
            {recentPosts.length > 0 && (
              <div className="text-center mt-8">
                <Link to="/tutorials">
                  <Button>View All Tutorials</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;