import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
}

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData as unknown as Order);
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsData) {
        setItems(itemsData);
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <Link to="/">
              <Button>Return to Home</Button>
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
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your order and will begin processing it soon.
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <div className="flex flex-wrap gap-6 justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-bold text-lg">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  order.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="flex items-center justify-between py-6 border-t border-b border-border">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Confirmed</span>
              </div>
              <div className="flex-1 h-1 bg-secondary mx-2">
                <div className="h-full gradient-primary w-1/4 rounded-full" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Processing</span>
              </div>
              <div className="flex-1 h-1 bg-secondary mx-2" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Shipping</span>
              </div>
              <div className="flex-1 h-1 bg-secondary mx-2" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Delivered</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-6">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-muted-foreground">
                {order.shipping_address.full_name}<br />
                {order.shipping_address.address_line1}<br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-4 pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/orders/${order.id}`}>
              <Button className="gradient-primary">
                Track Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
