import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { CategorySection } from '@/components/CategorySection';
import { PromoSection } from '@/components/PromoSection';
import { CartDrawer } from '@/components/CartDrawer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <PromoSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
