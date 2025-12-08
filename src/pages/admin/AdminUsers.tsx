import { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff } from 'lucide-react';
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
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: roles
          ?.filter(r => r.user_id === profile.user_id)
          .map(r => r.role) || ['user'],
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setIsLoading(false);
  };

  const toggleAdminRole = async (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
        toast({ title: 'Admin role removed' });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'admin' }]);

        if (error) throw error;
        toast({ title: 'Admin role granted' });
      }

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isAdmin = user.roles.includes('admin');
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 rounded-full text-xs ${
                              role === 'admin'
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdminRole(user.user_id, isAdmin)}
                        className={isAdmin ? 'text-destructive' : 'text-primary'}
                      >
                        {isAdmin ? (
                          <>
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-1" />
                            Make Admin
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
