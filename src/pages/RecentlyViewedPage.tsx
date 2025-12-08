import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ShoppingCart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ViewedItem {
  id: string;
  viewed_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    images: string[];
    slug: string;
    rating: number;
  };
}

const RecentlyViewedPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<ViewedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      const { data, error } = await supabase
        .from('viewed_history')
        .select(`
          id,
          viewed_at,
          product:products(id, name, price, original_price, images, slug, rating)
        `)
        .eq('user_id', user?.id)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems(data as unknown as ViewedItem[]);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    }
    setIsLoading(false);
  };

  const handleAddToCart = (item: ViewedItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || '/placeholder.svg',
      category: '',
      rating: item.product.rating || 0,
      reviews: 0,
      description: '',
      inStock: true,
    });
    toast({ title: 'Added to cart' });
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('viewed_history')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      setItems([]);
      toast({ title: 'History cleared' });
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your history</h1>
            <p className="text-muted-foreground mb-6">We'll remember what you've browsed</p>
            <Link to="/auth">
              <Button className="gradient-primary">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Recently Viewed</h1>
              <span className="text-muted-foreground">({items.length} items)</span>
            </div>
            {items.length > 0 && (
              <Button variant="outline" onClick={clearHistory}>
                Clear History
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4">
                  <Skeleton className="aspect-square rounded-xl mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No recently viewed items</h2>
              <p className="text-muted-foreground mb-6">Start browsing to see your history here</p>
              <Link to="/">
                <Button className="gradient-primary">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${item.product.slug}`}>
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={item.product.images?.[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-lg text-xs">
                        {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-muted-foreground">{item.product.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-primary">${item.product.price.toFixed(2)}</span>
                      {item.product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="w-full mt-4 gradient-primary"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecentlyViewedPage;
