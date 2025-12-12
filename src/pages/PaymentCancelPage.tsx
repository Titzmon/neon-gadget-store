import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-14 h-14 text-amber-600 dark:text-amber-400" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Payment Cancelled
            </h1>
            <p className="text-lg text-muted-foreground">
              Your payment was cancelled. Don't worry, your cart items are still saved.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 py-3 border-b border-border">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  Your cart items are still available
                </span>
              </div>
              
              <div className="flex items-center gap-3 py-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  Need help? Contact our support team
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Return to Cart
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelPage;
