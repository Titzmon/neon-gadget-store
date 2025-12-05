import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl">ElectroHub</span>
            </Link>
            <p className="text-background/70 mb-6">
              Your premier destination for cutting-edge electronics and tech gadgets. Experience the future today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-background/70 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/category/phones" className="text-background/70 hover:text-primary transition-colors">Shop All</Link>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Categories</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/category/phones" className="text-background/70 hover:text-primary transition-colors">Phones</Link>
              </li>
              <li>
                <Link to="/category/laptops" className="text-background/70 hover:text-primary transition-colors">Laptops</Link>
              </li>
              <li>
                <Link to="/category/audio" className="text-background/70 hover:text-primary transition-colors">Audio</Link>
              </li>
              <li>
                <Link to="/category/accessories" className="text-background/70 hover:text-primary transition-colors">Accessories</Link>
              </li>
              <li>
                <Link to="/category/smart-home" className="text-background/70 hover:text-primary transition-colors">Smart Home</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-background/70">123 Tech Street, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+1234567890" className="text-background/70 hover:text-primary transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:support@electrohub.com" className="text-background/70 hover:text-primary transition-colors">support@electrohub.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2024 ElectroHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/50 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/50 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-background/50 hover:text-primary transition-colors">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
