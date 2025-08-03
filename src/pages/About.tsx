import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSettings } from "@/context/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  const { aboutPageContent, loading } = useSettings();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            About Us
          </h1>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div
              className="prose prose-lg dark:prose-invert max-w-none mx-auto"
              dangerouslySetInnerHTML={{ __html: aboutPageContent || '<p class="text-center text-gray-600 dark:text-gray-400">No content available for the About page yet. Please add content in the admin settings.</p>' }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;