import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Activity, MessageSquare, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ posts: 0, categories: 0, comments: 0, views: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { count: categoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
      
      const { data: viewsData, error: viewsError } = await supabase.from('post_views').select('view_count');
      let totalViews = 0;
      if (!viewsError && viewsData) {
        totalViews = viewsData.reduce((acc, item) => acc + item.view_count, 0);
      }

      setStats({ 
        posts: postsCount || 0, 
        categories: categoriesCount || 0, 
        comments: commentsCount || 0,
        views: totalViews 
      });
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};