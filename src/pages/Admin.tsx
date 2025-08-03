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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from '@/components/RichTextEditor';
import { CategoryManager } from '@/components/CategoryManager';
import { SettingsManager } from '@/components/SettingsManager';

interface Post {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
}

const Admin = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) {
      showError('Failed to fetch posts');
      console.error(error);
    } else {
      setPosts(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      showError('Failed to fetch categories');
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

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
      fetchPosts();
    }
  };

  const handleDelete = async () => {
    if (!postToDelete || !postToDelete.id) return;
    const { error } = await supabase.from('posts').delete().eq('id', postToDelete.id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Post deleted successfully!');
      fetchPosts();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="flex justify-end my-4">
            <Button onClick={() => openDialog()}>Create New Post</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openDialog(post)} className="mr-2">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(post)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsManager />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCurrentPost(null);
        }
        setIsDialogOpen(isOpen);
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentPost?.id ? 'Edit Post' : 'Create Post'}</DialogTitle>
          </DialogHeader>
          <PostForm post={currentPost} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} categories={categories} />
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
    </div>
  );
};

const PostForm = ({ post, onSave, onCancel, categories }: { post: Post | null, onSave: (post: Post) => void, onCancel: () => void, categories: Category[] }) => {
  const [formData, setFormData] = useState<Post>(
    post || { title: '', description: '', image_url: '', category: '', slug: '' }
  );

  useEffect(() => {
    setFormData(post || { title: '', description: '', image_url: '', category: '', slug: '' });
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
      <Input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" required />
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
      <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (e.g., my-post-title)" required />
      <RichTextEditor value={formData.description} onChange={handleDescriptionChange} placeholder="Write your tutorial here..." />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default Admin;