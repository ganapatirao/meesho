import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfigAPI } from '../services/api';

const Footer = () => {
  const [config, setConfig] = useState({
    footer: {
      companyName: 'HappyShopping Clone',
      companyDescription: 'Your trusted e-commerce platform',
      socialLinks: [],
      companyInfoOrder: 1,
      businessLinks: [],
      businessLinksOrder: 2,
      contactFields: [],
      contactUsOrder: 3,
      copyrightText: '© 2024 HappyShopping Clone. All rights reserved.',
      copyrightLinks: [],
      copyrightSectionOrder: 4,
      backgroundColor: '#1F2937',
      backgroundColorEnd: '#111827',
      textColor: '#FFFFFF'
    }
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await siteConfigAPI.getConfiguration();
      if (response.data.success) {
        setConfig(response.data.configuration);
      }
    } catch (error) {
    }
  };

  const getOrderedSections = () => {
    const sections = [];
    
    // Company Info Section
    sections.push({
      order: config.footer?.companyInfoOrder || 1,
      type: 'company',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-pink-400 tracking-tight">{config.footer?.companyName || 'HappyShopping Clone'}</h3>
          <p className="text-gray-300 leading-relaxed text-sm">{config.footer?.companyDescription || 'Your trusted e-commerce platform'}</p>
          
          {config.footer?.socialLinks?.length > 0 && (
            <div className="flex gap-3 pt-2">
              {config.footer.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.iconLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-pink-500 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30"
                >
                  {link.icon ? (
                    <span className="text-lg">{link.icon}</span>
                  ) : (
                    <span className="text-lg">{link.iconName}</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )
    });

    // Business Links Section
    sections.push({
      order: config.footer?.businessLinksOrder || 2,
      type: 'business',
      content: (
        <div>
          <h4 className="text-lg font-bold mb-4 text-white border-b border-white/20 pb-2">Business Links</h4>
          <ul className="space-y-3">
            {config.footer?.businessLinks?.map((link, index) => (
              <li key={index}>
                <a
                  href={link.linkUrl}
                  className="text-gray-300 hover:text-pink-400 transition-all duration-300 text-sm py-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-pink-400 transition-colors"></span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )
    });

    // Contact Us Section
    sections.push({
      order: config.footer?.contactUsOrder || 3,
      type: 'contact',
      content: (
        <div>
          <h4 className="text-lg font-bold mb-4 text-white border-b border-white/20 pb-2">Contact Us</h4>
          <div className="space-y-3">
            {config.footer?.contactFields?.map((field, index) => (
              <div key={index} className="flex items-start gap-3 group">
                {field.icon && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-500/20 group-hover:bg-pink-500/40 transition-colors flex-shrink-0 mt-0.5">
                    <span className="text-sm text-pink-400">{field.icon}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{field.name}</p>
                  <p className="text-sm text-white font-medium break-words">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });

    return sections.sort((a, b) => a.order - b.order);
  };

  return (
    <footer style={{ background: `linear-gradient(135deg, ${config.footer?.backgroundColor || '#1F2937'} 0%, ${config.footer?.backgroundColorEnd || '#111827'} 100%)`, color: config.footer?.textColor || '#FFFFFF' }} className="mt-auto relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {getOrderedSections().map((section, index) => (
            <div key={index} className="footer-section bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
              {section.content}
            </div>
          ))}
        </div>

        {/* Copyright Text Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">{config.footer?.copyrightText || '© 2024 HappyShopping Clone. All rights reserved.'}</p>
            {config.footer?.copyrightLinks?.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-end gap-6">
                {config.footer.copyrightLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.linkUrl}
                    className="text-gray-400 hover:text-pink-400 transition-all duration-300 text-sm flex items-center gap-2 hover:underline hover:underline-offset-4"
                  >
                    {link.icon && <span className="text-xs">{link.icon}</span>}
                    {link.linkText}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
