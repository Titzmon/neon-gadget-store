import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroProducts = [
  {
    id: 'phone-1',
    name: 'ProMax Ultra 15',
    subtitle: 'The future is here',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
  },
  {
    id: 'laptop-1',
    name: 'MacBook Pro M4',
    subtitle: 'Supercharged performance',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  },
  {
    id: 'audio-1',
    name: 'AirPods Pro Max',
    subtitle: 'Immersive sound',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentProduct = heroProducts[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">New Arrivals 2024</span>
            </div>
            
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 transition-all duration-500 ${
                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <span className="text-gradient-primary">{currentProduct.name}</span>
              <br />
              <span className="text-foreground">{currentProduct.subtitle}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-up stagger-2">
              Discover the latest in cutting-edge technology. Premium devices designed for the extraordinary.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up stagger-3">
              <Link to={`/product/${currentProduct.id}`}>
                <Button variant="hero" size="xl" className="group">
                  Shop Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/category/phones">
                <Button variant="outline" size="xl">
                  Explore All
                </Button>
              </Link>
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-3 justify-center lg:justify-start mt-12">
              {heroProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsAnimating(false);
                    }, 500);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 gradient-primary' 
                      : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Image */}
          <div className="relative">
            <div 
              className={`relative z-10 transition-all duration-700 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl animate-float"
              />
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl gradient-primary shadow-glow flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="text-primary-foreground font-bold text-lg">NEW</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 px-6 py-4 rounded-2xl bg-card shadow-card animate-float" style={{ animationDelay: '1s' }}>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="text-2xl font-bold text-primary">$899</p>
              </div>
            </div>

            {/* Decorative Ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[120%] h-[120%] rounded-full border border-primary/10 animate-pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
