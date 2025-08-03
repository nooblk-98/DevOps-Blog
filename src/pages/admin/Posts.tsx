import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from '@/utils/toast';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pin, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface Post {
  id?: number;
  title: string;
  description: string;
  summary: string;
  image_url: string;
  category: string;
  slug: string;
  is_pinned: boolean;
  status: 'draft' | 'published';
}

interface Category {
  id: number;
  name: string;
}

export const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [filters, setFilters] = useState<{
    category: string;
    status: 'all' | 'draft' | 'published';
    pinned: 'all' | 'true' | 'false';
    dateRange: DateRange | undefined;
  }>({
    category: 'all',
    status: 'all',
    pinned: 'all',
    dateRange: undefined,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase.from('posts').select('*');

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.pinned !== 'all') {
        query = query.eq('is_pinned', filters.pinned === 'true');
      }
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        query = query.lte('created_at', toDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        showError('Failed to fetch posts');
        console.error(error);
      } else {
        setPosts(data || []);
      }
    };

    fetchPosts();
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) {
        showError('Failed to fetch categories');
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      pinned: 'all',
      dateRange: undefined,
    });
  };

  const handleSave = async (post: Post) => {
    const { id, ...postData } = post;
    const { error } = id
      ? await supabase.from('posts').update(postData).eq('id', id)
      : await supabase.from('posts').insert(postData);

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Post ${id ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setCurrentPost(null);
      resetFilters(); // Reset filters to ensure new/updated post is visible
    }
  };

  const handleDelete = async () => {
    if (!postToDelete || !postToDelete.id) return;
    const { error } = await supabase.from('posts').delete().eq('id', postToDelete.id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Post deleted successfully!');
      setFilters(f => ({...f})); // Re-trigger fetch
    }
    setIsAlertOpen(false);
    setPostToDelete(null);
  };

  const openDeleteConfirm = (post: Post) => {
    setPostToDelete(post);
    setIsAlertOpen(true);
  };

  const openDialog = (post: Post | null = null) => {
    setCurrentPost(post);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Posts</h1>
        <Button onClick={() => openDialog()}>Create New Post</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Posts</CardTitle>
          <CardDescription>Create, edit, and delete your blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 border rounded-lg">
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.pinned} onValueChange={(value) => handleFilterChange('pinned', value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by pinned..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pinned</SelectItem>
                <SelectItem value="true">Pinned</SelectItem>
                <SelectItem value="false">Not Pinned</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(date) => handleFilterChange('dateRange', date)}
            />
            <Button variant="ghost" onClick={resetFilters}>Reset Filters</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/posts/${post.slug}`} target="_blank">
                      <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => openDialog(post)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(post)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCurrentPost(null);
        }
        setIsDialogOpen(isOpen);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle>{currentPost?.id ? 'Edit Post' : 'Create Post'}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto">
            <PostForm post={currentPost} onSave={handleSave} categories={categories} />
          </div>
          <DialogFooter className="p-6 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="post-form">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const PostForm = ({ post, onSave, categories }: { post: Post | null, onSave: (post: Post) => void, categories: Category[] }) => {
  const defaultPostState: Post = { title: '', description: '', summary: '', image_url: '', category: '', slug: '', is_pinned: false, status: 'draft' };
  const [formData, setFormData] = useState<Post>(post || defaultPostState);

  useEffect(() => {
    setFormData(post || defaultPostState);
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleStatusChange = (value: 'draft' | 'published') => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handlePinChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_pinned: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form id="post-form" onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (e.g., my-post-title)" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={handleCategoryChange} value={formData.category}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select onValueChange={handleStatusChange} value={formData.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} placeholder="A short summary for the post card." required />
      </div>
      <div className="space-y-2">
        <Label>Full Content</Label>
        <RichTextEditor value={formData.description} onChange={handleDescriptionChange} placeholder="Write your tutorial here..." />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="is_pinned"
          checked={formData.is_pinned}
          onCheckedChange={handlePinChange}
        />
        <Label htmlFor="is_pinned">Pin this post to the homepage</Label>
      </div>
    </form>
  );
};