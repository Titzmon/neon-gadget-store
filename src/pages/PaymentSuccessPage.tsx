import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSuccess = async () => {
      // Clear the cart after successful payment
      clearCart();

      // Send confirmation email if we have an order ID
      if (orderId && !emailSent) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { error } = await supabase.functions.invoke('send-order-email', {
              body: { orderId, type: 'confirmation' }
            });
            
            if (error) {
              console.error('Failed to send confirmation email:', error);
            } else {
              setEmailSent(true);
              toast({
                title: "Confirmation email sent",
                description: "Check your inbox for order details.",
              });
            }
          }
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }
      setLoading(false);
    };

    handleSuccess();
  }, [orderId, clearCart, emailSent, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              {sessionId && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Session ID</span>
                  <span className="font-mono text-sm">{sessionId.slice(0, 20)}...</span>
                </div>
              )}
              
              {orderId && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{orderId.slice(0, 20)}...</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 py-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  {emailSent 
                    ? "Confirmation email sent to your inbox" 
                    : loading 
                      ? "Sending confirmation email..." 
                      : "Confirmation email will be sent shortly"}
                </span>
              </div>
              
              <div className="flex items-center gap-3 py-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  Your order is being processed
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId && (
              <Button asChild size="lg">
                <Link to={`/orders/${orderId}`}>
                  View Order Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
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

export default PaymentSuccessPage;
