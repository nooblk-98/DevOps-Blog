import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSettings } from "@/context/SettingsContext";

const Index = () => {
  const { banner: bannerSettings } = useSettings();

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
      </main>
      <Footer />
    </div>
  );
};

export default Index;