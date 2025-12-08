import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, ChevronRight, Wallet } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  
  // Shipping address
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  const shippingCost = totalPrice > 100 ? 0 : 9.99;
  const taxRate = 0.08;
  const taxAmount = totalPrice * taxRate;
  const orderTotal = totalPrice + shippingCost + taxAmount;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
          shipping_address: {
            full_name: fullName,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  };

  const handleCODOrder = async () => {
    setIsLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id,
          order_number: generateOrderNumber(),
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: orderTotal,
          payment_method: 'cod',
          payment_status: 'pending',
          status: 'pending',
          shipping_address: {
            full_name: fullName,
            phone,
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country,
          },
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order confirmation email
      await supabase.functions.invoke('send-order-email', {
        body: { orderId: order.id, type: 'confirmation' },
      });

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      toast({
        title: 'Order failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'stripe' || paymentMethod === 'card') {
      await handleStripeCheckout();
    } else if (paymentMethod === 'cod') {
      await handleCODOrder();
    } else {
      toast({
        title: 'Payment method not available',
        description: 'This payment method is coming soon',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Address */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <CreditCard className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely with Stripe</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-2xl">💳</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Wallet className="w-6 h-6 text-[#003087]" />
                        <div className="flex-1">
                          <p className="font-medium">PayPal</p>
                          <p className="text-sm text-muted-foreground">Fast and secure payment</p>
                        </div>
                        <span className="text-2xl">🅿️</span>
                      </label>

                      <label className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="cod" id="cod" />
                        <span className="text-2xl">💵</span>
                        <div className="flex-1">
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                          <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full mt-6 h-12 gradient-primary text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
