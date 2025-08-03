import { useSettings } from "@/context/SettingsContext";
import { Github, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react'; // Changed Whatsapp to MessageCircle

export const Footer = () => {
  const { site, socialLinks } = useSettings();

  const socialIcons = {
    github: Github,
    whatsapp: MessageCircle, // Using MessageCircle for Whatsapp
    linkedin: Linkedin,
    facebook: Facebook,
    instagram: Instagram,
  };

  return (
    <footer className="bg-gray-900 text-white py-6 px-6 md:px-8">
      <div className="container mx-auto text-center flex flex-col md:flex-row justify-between items-center">
        <p className="mb-4 md:mb-0">© 2024 {site.name}. All rights reserved.</p>
        <div className="flex space-x-4">
          {Object.entries(socialLinks).map(([platform, { url, enabled }]) => {
            const Icon = socialIcons[platform as keyof typeof socialIcons];
            return enabled && url ? (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon className="h-6 w-6" />
                <span className="sr-only">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
              </a>
            ) : null;
          })}
        </div>
      </div>
    </footer>
  );
};