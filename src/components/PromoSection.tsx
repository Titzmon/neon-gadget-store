import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $99',
  },
  {
    icon: Shield,
    title: '2 Year Warranty',
    description: 'Full coverage included',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Expert assistance anytime',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day money back',
  },
];

export const PromoSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center p-6 rounded-2xl bg-card shadow-soft animate-fade-up opacity-0"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="w-14 h-14 rounded-xl gradient-primary mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
          </div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Ready to Upgrade Your Tech?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers. Get exclusive deals and early access to new products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/category/phones">
                <Button 
                  size="xl" 
                  className="bg-background text-foreground hover:bg-background/90 shadow-lg"
                >
                  Shop Now
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="xl"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
