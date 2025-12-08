import { useEffect, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  shipping_address: any;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setIsLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      
      toast({ title: 'Order status updated' });
      fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'shipped': return 'bg-blue-500/10 text-blue-500';
      case 'processing': return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredOrders = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${Number(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="capitalize">{order.payment_method}</p>
                      <p className={`text-xs ${
                        order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {order.payment_status}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer</h3>
                  <p>{selectedOrder.profiles?.full_name}</p>
                  <p className="text-muted-foreground">{selectedOrder.profiles?.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p>{selectedOrder.shipping_address?.full_name}</p>
                  <p className="text-muted-foreground text-sm">
                    {selectedOrder.shipping_address?.address_line1}<br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${Number(item.total_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
