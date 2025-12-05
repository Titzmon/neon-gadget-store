import { Link } from 'react-router-dom';
import { categories } from '@/data/products';
import { ArrowRight } from 'lucide-react';

const categoryImages: Record<string, string> = {
  phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  audio: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&q=80',
  accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  'smart-home': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80',
};

export const CategorySection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Find exactly what you're looking for in our curated collections
            </p>
          </div>
          <Link 
            to="/category/phones"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative aspect-square rounded-2xl overflow-hidden animate-fade-up opacity-0"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Background Image */}
              <img
                src={categoryImages[category.id]}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-4xl mb-2">{category.icon}</span>
                <h3 className="text-background font-semibold text-lg md:text-xl">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-background/70 text-sm mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
