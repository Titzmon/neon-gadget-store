import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { categories, searchProducts } from '@/data/products';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const searchResults = searchQuery.length > 2 ? searchProducts(searchQuery).slice(0, 5) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">ElectroHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium">
                Categories
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  isCategoriesOpen && "rotate-180"
                )} />
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-card rounded-xl shadow-card border border-border p-2 min-w-[200px] animate-fade-up">
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/category/phones" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Deals
            </Link>
          </div>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex relative flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-card border border-border overflow-hidden animate-fade-up">
                {searchResults.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex items-center gap-4 p-3 hover:bg-secondary transition-colors"
                    onClick={() => setShowSearchResults(false)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-primary font-semibold">${product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/recently-viewed">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Clock className="w-5 h-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{profile?.full_name || profile?.username || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="cursor-pointer">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/recently-viewed" className="cursor-pointer">Recently Viewed</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer text-primary">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <LogIn className="w-5 h-5" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-accent text-accent-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </form>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 animate-fade-up">
            <div className="flex flex-col gap-2">
              <Link 
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                Home
              </Link>
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link 
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link 
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                  <Link 
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Wishlist</span>
                  </Link>
                  <Link 
                    to="/recently-viewed"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Recently Viewed</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-primary"
                    >
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-destructive w-full text-left"
                  >
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
