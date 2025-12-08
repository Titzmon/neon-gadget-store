import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Eye,
  MousePointer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalPageViews: number;
  totalClicks: number;
  conversionRate: number;
  abandonedCarts: number;
  topCategories: { name: string; views: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalPageViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    abandonedCarts: 0,
    topCategories: [],
    dailyRevenue: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, event_data, created_at');

      const pageViews = events?.filter(e => e.event_type === 'page_view').length || 0;
      const clicks = events?.filter(e => e.event_type === 'click').length || 0;

      // Fetch orders for conversion and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');

      const completedOrders = orders?.filter(o => o.status !== 'cancelled').length || 0;
      
      // Fetch carts
      const { data: carts } = await supabase
        .from('carts')
        .select('id, cart_items(id)');

      const cartsWithItems = carts?.filter(c => c.cart_items && c.cart_items.length > 0).length || 0;
      const conversionRate = cartsWithItems > 0 ? (completedOrders / cartsWithItems) * 100 : 0;
      const abandonedCarts = cartsWithItems - completedOrders;

      // Calculate daily revenue for last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyRevenue = last7Days.map(date => {
        const dayOrders = orders?.filter(o => 
          o.created_at.startsWith(date) && o.status !== 'cancelled'
        ) || [];
        const amount = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        return { date, amount };
      });

      // Fetch category views from analytics
      const categoryViews = events?.filter(e => e.event_type === 'category_view') || [];
      const categoryCount: Record<string, number> = {};
      categoryViews.forEach(e => {
        const category = (e.event_data as any)?.category || 'Unknown';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setData({
        totalPageViews: pageViews,
        totalClicks: clicks,
        conversionRate,
        abandonedCarts: Math.max(0, abandonedCarts),
        topCategories,
        dailyRevenue,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold mt-1">{data.totalPageViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">{data.totalClicks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">{data.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abandoned Carts</p>
                <p className="text-2xl font-bold mt-1">{data.abandonedCarts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dailyRevenue.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-24">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (day.amount / Math.max(...data.dailyRevenue.map(d => d.amount), 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold w-24 text-right">${day.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Viewed Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No category data yet. Views will appear here as users browse.
              </p>
            ) : (
              <div className="space-y-4">
                {data.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{category.views} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
