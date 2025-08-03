import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { showError, showSuccess } from '@/utils/toast';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id?: number;
  name: string;
}

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) {
      showError('Failed to fetch categories');
      console.error(error);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory || !currentCategory.name) return;

    const { id, ...categoryData } = currentCategory;
    const { error } = id
      ? await supabase.from('categories').update(categoryData).eq('id', id)
      : await supabase.from('categories').insert(categoryData);

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Category ${id ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Category deleted successfully!');
      fetchCategories();
    }
    setIsAlertOpen(false);
    setCategoryToDelete(null);
  };

  const openDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setIsAlertOpen(true);
  };

  const openDialog = (category: Category | null = null) => {
    setCurrentCategory(category ? { ...category } : { name: '' });
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Categories</h1>
        <Button onClick={() => openDialog()}>Create New Category</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>Organize your posts by creating and managing categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openDialog(category)} className="mr-2">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(category)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCurrentCategory(null);
        }
        setIsDialogOpen(isOpen);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-2 py-4">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={currentCategory?.name || ''}
                onChange={(e) => setCurrentCategory(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value })}
                placeholder="Category Name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
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