import { useState, useEffect } from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profiles: Profile;
}

interface Profile {
  profile_image?: string;
  role: string;
  open_to_networking: boolean;
  social_link?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  interests: string[];
}

const availableInterests = [
  'AI/ML',
  'Cloud Computing',
  'DevOps',
  'Security',
  'Mobile Development',
  'Web Development',
  'Blockchain',
  'IoT',
  'Data Science',
  'UI/UX Design',
];

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getCurrentAttendee();
        const profileData = response.data.message;
        // Ensure profiles and interests exist
        if (!profileData) {
          setUser(null);
          return;
        }
        if (!profileData.profiles) {
          profileData.profiles = {
            role: '',
            open_to_networking: false,
            interests: [],
          };
        } else if (!profileData.profiles.interests) {
          profileData.profiles.interests = [];
        }
        setUser(profileData);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };


  const toggleInterest = (interest: string) => {
    setUser((prev) => {
      if (!prev) return prev;

      const currentInterests = prev.profiles.interests || [];
      const updatedInterests = currentInterests.includes(interest)
        ? currentInterests.filter((i) => i !== interest)
        : [...currentInterests, interest];

      const updatedProfile = { ...prev.profiles, interests: updatedInterests };

      return {
        ...prev,
        profiles: updatedProfile,
      };
    });
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <p className="text-red-500">{error || 'Failed to load profile'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your profile and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Profile Information</h2>
                <Badge className={
                  user.profiles.role === 'VIP'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                }>
                  {user.profiles.role} Member
                </Badge>
              </div>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user.first_name}
                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select your areas of interest to improve networking matches
            </p>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={(user.profiles.interests || []).includes(interest) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${!isEditing && !(user.profiles.interests || []).includes(interest) ? 'opacity-70 hover:opacity-100' : ''}`}
                  onClick={() => isEditing && toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="networking" className="text-base">Enable Networking</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow other attendees to find and connect with you
                  </p>
                </div>
                <Switch
                  id="networking"
                  checked={user.profiles.open_to_networking}
                  onCheckedChange={(checked) =>
                    setUser({ ...user, profiles: { ...user.profiles, open_to_networking: checked } })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="size-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={user.profiles.social_link || ''}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      profiles: { ...user.profiles, social_link: e.target.value },
                    })
                  }
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              {/* <div>
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="size-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={user.socialLinks.twitter || ''}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      socialLinks: { ...user.socialLinks, twitter: e.target.value },
                    })
                  }
                  disabled={!isEditing}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
