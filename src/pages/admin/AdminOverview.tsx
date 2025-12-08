import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
}

interface TopProduct {
  id: string;
  name: string;
  total_sold: number;
  revenue: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 12.5,
    ordersChange: 8.2,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch orders for revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at');

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch top products by order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, total_price');

      const productStats: Record<string, TopProduct> = {};
      orderItems?.forEach(item => {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            id: item.product_id,
            name: item.product_name,
            total_sold: 0,
            revenue: 0,
          };
        }
        productStats[item.product_id].total_sold += item.quantity;
        productStats[item.product_id].revenue += Number(item.total_price);
      });

      const topProductsList = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        revenueChange: 12.5,
        ordersChange: 8.2,
      });
      setTopProducts(topProductsList);
      setRecentOrders(recent || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setIsLoading(false);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: 5.3,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: 2.1,
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={stat.change > 0 ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-muted-foreground text-sm">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.full_name || order.profiles?.email || 'Guest'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sales data yet</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.total_sold} sold</p>
                    </div>
                    <p className="font-semibold text-primary">${product.revenue.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
