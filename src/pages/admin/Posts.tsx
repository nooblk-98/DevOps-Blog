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

interface Post {
  id?: number;
  title: string;
  description: string;
  summary: string;
  image_url: string;
  category: string;
  slug: string;
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
  const [formData, setFormData] = useState<Post>(
    post || { title: '', description: '', summary: '', image_url: '', category: '', slug: '' }
  );

  useEffect(() => {
    setFormData(post || { title: '', description: '', summary: '', image_url: '', category: '', slug: '' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form id="post-form" onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" required />
      </div>
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
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (e.g., my-post-title)" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} placeholder="A short summary for the post card." required />
      </div>
      <div className="space-y-2">
        <Label>Full Content</Label>
        <RichTextEditor value={formData.description} onChange={handleDescriptionChange} placeholder="Write your tutorial here..." />
      </div>
    </form>
  );
};