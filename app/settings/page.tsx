'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Phone, Calendar, Shield, Bell, Save, Camera, Trash2, Eye, EyeOff, Lock } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    appointments: boolean;
    marketing: boolean;
  };
  privacy: {
    shareData: boolean;
    profileVisibility: 'public' | 'private';
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse',
    },
    notifications: {
      email: true,
      sms: true,
      appointments: true,
      marketing: false,
    },
    privacy: {
      shareData: false,
      profileVisibility: 'private',
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [user, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = () => {
    // In a real app, this would open a password change modal
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      alert('Password change functionality would be implemented here');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      alert('Account deletion functionality would be implemented here');
      logout();
      router.push('/');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a cloud storage
      alert(`Image upload functionality for ${file.name} would be implemented here`);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'security', label: 'Security', icon: Lock },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="relative">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(profile.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'email' && 'Receive email notifications about appointments and updates'}
                      {key === 'sms' && 'Get SMS reminders for upcoming appointments'}
                      {key === 'appointments' && 'Notifications for appointment confirmations and reminders'}
                      {key === 'marketing' && 'Receive promotional emails and newsletters'}
                    </p>
                  </div>
                  <Button
                    variant={value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProfile(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, [key]: !value }
                    }))}
                  >
                    {value ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile information
                  </p>
                </div>
                <select
                  value={profile.privacy.profileVisibility}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    privacy: { ...prev.privacy, profileVisibility: e.target.value as any }
                  }))}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Data Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing of anonymized data for research purposes
                  </p>
                </div>
                <Button
                  variant={profile.privacy.shareData ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProfile(prev => ({ 
                    ...prev, 
                    privacy: { ...prev.privacy, shareData: !prev.privacy.shareData }
                  }))}
                >
                  {profile.privacy.shareData ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-muted"
                  />
                </div>
                <Button onClick={handlePasswordChange} className="w-full">
                  Change Password
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Two-Factor Authentication</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-foreground">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            className="text-destructive hover:bg-destructive hover:text-white"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
