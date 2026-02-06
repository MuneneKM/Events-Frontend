import { useEffect, useState } from 'react';
import { Linkedin } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { authAPI } from '../services/api';
import { toast } from 'sonner';



interface Profile {
  profile_id: string;
  profile_image?: string | null;
  role: string;
  open_to_networking: boolean | number;
  social_link?: string | null;
  company?: string | null;
  job_title?: string | null;
  bio?: string | null;
  interests: string[];
}

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  full_name: string;
  is_logged_in: boolean;
  profiles: Profile[];
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [socialLink, setSocialLink] = useState<string>('');
  const [networkingEnabled, setNetworkingEnabled] = useState<boolean>(false);



  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getCurrentAttendee();
        const data: UserProfile = response.data.message;

        if (!data || !data.profiles?.length) {
          setUser(null);
          return;
        }

        setUser(data);
        setProfile({
          ...data.profiles[0],
          interests: data.profiles[0].interests ?? [],
        });
        setNetworkingEnabled(Boolean(data.profiles[0].open_to_networking));
        setSocialLink(data.profiles[0].social_link ?? '');
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);



  const toggleInterest = (interest: string) => {
    if (!isEditing || !profile) return;

    setProfile((prev) => {
      if (!prev) return prev;

      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];

      return { ...prev, interests };
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      await authAPI.updateProfile({
        profile_id: profile.profile_id,
        interests: profile.interests,
        open_to_networking: networkingEnabled,
        social_link: socialLink || undefined,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                <h2 className="text-xl font-semibold mb-1">
                  Profile Information
                </h2>
                <Badge
                  className={
                    profile.role === 'VIP'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  }
                >
                  {profile.role} Member
                </Badge>
              </div>

              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={saving}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={user.first_name} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => {
                const selected = profile.interests.includes(interest);

                return (
                  <Badge
                    key={interest}
                    variant={selected ? 'default' : 'outline'}
                    className={`cursor-pointer ${!isEditing && !selected ? 'opacity-70' : ''
                      }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Enable Networking</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow other attendees to find and connect with you
                </p>
              </div>
              <Switch
                checked={networkingEnabled}
                onCheckedChange={setNetworkingEnabled}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Social Media Links
            </h2>
            <div>
              <Label className="flex items-center gap-2">
                <Linkedin className="size-4" />
                LinkedIn
              </Label>
              <Input
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
