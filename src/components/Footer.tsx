import { useSettings } from "@/context/SettingsContext";
import { Github, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react';

export const Footer = () => {
  const { site, socialLinks } = useSettings();

  const socialIcons = {
    github: Github,
    whatsapp: MessageCircle,
    linkedin: Linkedin,
    facebook: Facebook,
    instagram: Instagram,
  };

  const hasEnabledSocialLinks = Object.values(socialLinks).some(link => link.enabled && link.url);

  return (
    <footer className="bg-gray-900 text-white py-6 px-6 md:px-8">
      <div className={`container mx-auto flex flex-col items-center ${hasEnabledSocialLinks ? 'md:flex-row md:justify-between' : 'md:justify-center'}`}>
        <p className="mb-4 md:mb-0">© 2024 {site.name}. All rights reserved.</p>
        {hasEnabledSocialLinks && (
          <div className="flex space-x-4">
            {Object.entries(socialIcons).map(([platform, Icon]) => {
              const link = socialLinks[platform as keyof typeof socialLinks];
              return link.enabled && link.url ? (
                <a
                  key={platform}
                  href={link.url}
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
        )}
      </div>
    </footer>
  );
};