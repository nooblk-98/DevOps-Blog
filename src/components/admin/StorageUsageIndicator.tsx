import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HardDrive } from 'lucide-react';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const StorageUsageIndicator = () => {
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorageUsage = async () => {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-storage-usage');
        
        if (error) throw error;

        if (data && data.total_size_bytes !== undefined && data.total_size_limit_bytes !== undefined) {
          setUsage({
            used: data.total_size_bytes,
            limit: data.total_size_limit_bytes,
          });
        } else {
          throw new Error("Invalid data received from function.");
        }
      } catch (e: any) {
        console.error("Failed to fetch storage usage:", e);
        setError("Could not load storage data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStorageUsage();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-10 w-full" />;
    }

    if (error) {
      return <p className="text-xs text-destructive">{error}</p>;
    }

    if (usage) {
      const percentage = (usage.used / usage.limit) * 100;
      return (
        <div>
          <Progress value={percentage} className="w-full h-2 mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {formatBytes(usage.used)} of {formatBytes(usage.limit)} used
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="px-2 lg:px-4 mt-auto mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <HardDrive className="h-4 w-4" />
            <span>Storage Usage</span>
        </div>
        {renderContent()}
    </div>
  );
};