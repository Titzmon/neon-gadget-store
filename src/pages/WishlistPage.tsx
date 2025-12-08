import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    images: string[];
    slug: string;
  };
}

const WishlistPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product:products(id, name, price, original_price, images, slug)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setItems(data as unknown as WishlistItem[]);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
    setIsLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;
      setItems(items.filter(item => item.id !== wishlistId));
      toast({ title: 'Removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || '/placeholder.svg',
      category: '',
      rating: 0,
      reviews: 0,
      description: '',
      inStock: true,
    });
    toast({ title: 'Added to cart' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view your wishlist</h1>
            <p className="text-muted-foreground mb-6">Save your favorite items for later</p>
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
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <span className="text-muted-foreground">({items.length} items)</span>
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
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Start adding items you love!</p>
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
                      {item.product.original_price && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-lg text-xs font-semibold">
                          {Math.round((1 - item.product.price / item.product.original_price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-primary">${item.product.price.toFixed(2)}</span>
                      {item.product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 gradient-primary"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => removeFromWishlist(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

export default WishlistPage;
