import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPost } from "@/components/BlogPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/SettingsContext";

interface Post {
  id: number;
  title: string;
  description: string;
  link: string;
  image_url: string;
  category: string;
  slug: string;
  created_at: string;
}

const POSTS_PER_PAGE = 6; // Define how many posts to load per page

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Use 0-based index for offset
  const [hasMore, setHasMore] = useState(true); // To check if there are more posts to load
  const { banner: bannerSettings, loading: loadingSettings } = useSettings();

  const fetchPosts = useCallback(async (page: number) => {
    setLoadingPosts(true);
    const offset = page * POSTS_PER_PAGE;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1); // Fetch range

    if (error) {
      console.error('Error fetching posts:', error);
      setHasMore(false); // Assume no more if error
    } else {
      const formattedPosts = (data || []).map(p => ({...p, link: `/tutorials/${p.slug}`}));
      setPosts(prevPosts => (page === 0 ? formattedPosts : [...prevPosts, ...formattedPosts]));
      setHasMore(formattedPosts.length === POSTS_PER_PAGE); // Check if exactly POSTS_PER_PAGE were returned
    }
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    fetchPosts(0); // Load initial posts on component mount
  }, [fetchPosts]);

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
    fetchPosts(currentPage + 1);
  };

  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = posts
    .filter((post) => {
      if (selectedCategory === "All") return true;
      return post.category === selectedCategory;
    })
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                Latest Tutorials
              </h2>
              <div className="mt-6 flex justify-center flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-lg w-full"
                />
              </div>
            </div>
            {loadingPosts && currentPage === 0 ? ( // Show skeleton only for initial load
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(POSTS_PER_PAGE)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <BlogPost
                    key={post.id}
                    title={post.title}
                    description={post.description}
                    link={post.link}
                    imageUrl={post.image_url}
                    date={post.created_at}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No tutorials found.
              </p>
            )}
            {hasMore && !loadingPosts && filteredPosts.length > 0 && (
              <div className="text-center mt-8">
                <Button onClick={handleLoadMore}>Load More</Button>
              </div>
            )}
            {loadingPosts && currentPage > 0 && ( // Show skeleton for subsequent loads
              <div className="text-center mt-8">
                <Skeleton className="h-10 w-32 mx-auto" />
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