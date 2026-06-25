import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfigAPI } from '../services/api';

const Footer = () => {
  const [config, setConfig] = useState({
    footer: {
      companyName: 'Meesho',
      description: 'Shop for the latest fashion, electronics, home products and more at the best prices.',
      email: 'support@meesho.com',
      phone: '+91 98765 43210',
      address: 'Bangalore, India',
      copyrightText: '© 2024 Meesho Clone. All rights reserved.',
    },
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
      console.error('Error loading configuration:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-pink-400">{config.footer?.companyName || 'Meesho'}</h3>
            <p className="text-gray-400 mb-4">
              {config.footer?.description || 'Shop for the latest fashion, electronics, home products and more at the best prices.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Track Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={18} />
                <span>{config.footer?.email || 'support@meesho.com'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={18} />
                <span>{config.footer?.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} />
                <span>{config.footer?.address || 'Bangalore, India'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {config.footer?.copyrightText || '© 2024 Meesho Clone. All rights reserved.'}
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
