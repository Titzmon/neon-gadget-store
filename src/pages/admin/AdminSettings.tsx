import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    storeName: 'TechStore',
    storeEmail: 'support@techstore.com',
    currency: 'USD',
    taxRate: '8',
    freeShippingThreshold: '100',
    enableReviews: true,
    enableWishlist: true,
    enableGuestCheckout: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({ title: 'Settings saved successfully' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} className="gradient-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Store Email</Label>
                <Input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Free Shipping Threshold ($)</Label>
                <Input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium">Product Reviews</p>
                <p className="text-sm text-muted-foreground">Allow customers to leave reviews</p>
              </div>
              <Switch
                checked={settings.enableReviews}
                onCheckedChange={(checked) => setSettings({ ...settings, enableReviews: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium">Wishlist</p>
                <p className="text-sm text-muted-foreground">Allow customers to save items to wishlist</p>
              </div>
              <Switch
                checked={settings.enableWishlist}
                onCheckedChange={(checked) => setSettings({ ...settings, enableWishlist: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium">Guest Checkout</p>
                <p className="text-sm text-muted-foreground">Allow checkout without account</p>
              </div>
              <Switch
                checked={settings.enableGuestCheckout}
                onCheckedChange={(checked) => setSettings({ ...settings, enableGuestCheckout: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10">
              <div>
                <p className="font-medium text-destructive">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Disable the store for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
