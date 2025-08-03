import { useSettings } from "@/context/SettingsContext";

export const Footer = () => {
  const { site } = useSettings();
  return (
    <footer className="bg-gray-900 text-white py-6 px-6 md:px-8">
      <div className="container mx-auto text-center">
        <p>© 2024 {site.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};