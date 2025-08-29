import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogPost } from "@/components/BlogPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: number;
  title: string;
  description: string;
  summary: string;
  link: string;
  image_url: string;
  slug: string;
  created_at: string;
  categories: { name: string }[];
}

interface Category { id: number; name: string }

const POSTS_PER_PAGE = 6;

const PostsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchPosts = useCallback(async (page: number, categoryFilter: string = "All") => {
    setLoadingPosts(true);
    const offset = page * POSTS_PER_PAGE;
    
    let query = supabase
      .from('posts')
      .select('*, categories(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (categoryFilter !== "All") {
      const cat = categories.find(c => c.name === categoryFilter)
      if (cat) {
        const { data: postIds, error: postIdsError } = await supabase
          .from('post_categories')
          .select('post_id')
          .eq('category_id', cat.id);
        if (postIdsError) {
          console.error('Error fetching post IDs for category', postIdsError);
          setHasMore(false);
        } else {
          const ids = postIds.map((p: any) => p.post_id);
          query = query.in('id', ids);
        }
      }
    }

    const { data, error } = await query.range(offset, offset + POSTS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      setHasMore(false);
    } else {
      const formattedPosts = (data || []).map(p => ({...p, link: `/posts/${p.slug}`})) as Post[];
      setPosts(prevPosts => (page === 0 ? formattedPosts : [...prevPosts, ...formattedPosts]));
      setHasMore(formattedPosts.length === POSTS_PER_PAGE);
    }
    setLoadingPosts(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories((data || []) as any);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(0);
    setPosts([]);
    fetchPosts(0, selectedCategory);
  }, [fetchPosts, selectedCategory]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage, selectedCategory);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
              All Posts
            </h1>
            <div className="mt-6 flex justify-center flex-wrap gap-2 mb-6">
              {["All", ...categories.map(c => c.name)].map((category) => (
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
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-lg w-full"
              />
            </div>
          </div>
          {loadingPosts && currentPage === 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(POSTS_PER_PAGE)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
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
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No posts found.
            </p>
          )}
          {hasMore && !loadingPosts && filteredPosts.length > 0 && (
            <div className="text-center mt-8">
              <Button onClick={handleLoadMore}>Load More</Button>
            </div>
          )}
          {loadingPosts && currentPage > 0 && (
            <div className="text-center mt-8">
              <Skeleton className="h-10 w-32 mx-auto" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostsPage;
