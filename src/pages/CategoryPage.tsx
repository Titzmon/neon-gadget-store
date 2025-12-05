import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { getProductsByCategory, categories } from '@/data/products';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const products = getProductsByCategory(categoryId || '');
  const category = categories.find(c => c.id === categoryId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{category?.name || 'Category'}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{category?.icon}</span>
              <h1 className="text-4xl md:text-5xl font-bold">{category?.name || 'Products'}</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {products.length} products available
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
