import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, MapPin, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const statusSteps = ['pending', 'processing', 'packing', 'shipping', 'delivered'];

const OrderDetailPage = () => {
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

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const index = statusSteps.indexOf(order.status);
    return index === -1 ? 0 : index;
  };

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
            <Link to="/orders">
              <Button>Back to Orders</Button>
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
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{order.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status Timeline */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold mb-6">Order Status</h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-secondary" />
                  
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= getCurrentStepIndex();
                    const isCurrent = index === getCurrentStepIndex();
                    
                    return (
                      <div key={step} className="relative flex items-start gap-4 pb-6 last:pb-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          isCompleted 
                            ? 'gradient-primary' 
                            : 'bg-secondary'
                        }`}>
                          {step === 'pending' && <Clock className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                          {step === 'processing' && <Package className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                          {step === 'packing' && <Package className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                          {step === 'shipping' && <Truck className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                          {step === 'delivered' && <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />}
                        </div>
                        <div className="flex-1 pt-3">
                          <p className={`font-medium capitalize ${isCurrent ? 'text-primary' : ''}`}>
                            {step}
                            {isCurrent && <span className="ml-2 text-xs">(Current)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step === 'pending' && 'Order received and being reviewed'}
                            {step === 'processing' && 'Preparing your order'}
                            {step === 'packing' && 'Items being packed'}
                            {step === 'shipping' && 'On the way to you'}
                            {step === 'delivered' && 'Successfully delivered'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.tracking_number && (
                  <div className="mt-6 p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                    <p className="font-mono font-medium">{order.tracking_number}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold mb-4">Items Ordered</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.product_id}`}
                      className="flex gap-4 hover:bg-secondary/50 -mx-4 px-4 py-2 rounded-lg transition-colors"
                    >
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold mb-4">Payment</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Shipping Address</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
