import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Building2, Store, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: string;
  name: string;
  banner_image: string;
  start_date: string;
  end_date: string;
  host_name: string;
  venue_name: string;
}

// Sponsor Tier API response format
interface SponsorTier {
  name: string;
  tier_name: string;
  amount: number;
  currency: string;
  description: string;
}

// Booth Package API response format
interface BoothPackage {
  name: string;
  package_name: string;
  booth_size: string;
  price: number;
  currency: string;
  available_booths: number;
  includes_passes: number;
  includes_power: boolean;
  includes_internet: boolean;
}

interface SponsorFormData {
  sponsor_name: string;
  tier: string;
  tier_name: string;
  amount: number;
  event: string;
  company: string;
  company_logo: FileList | null;
}

interface BoothFormData {
  exhibitor_name: string;
  email: string;
  phone: string;
  logo: FileList | null;
  website: string;
  event: string;
  booth_package: string;
  package_name: string;
  price: number;
  notes: string;
}

type Props = {
  html: string;
};

export function HtmlRenderer({ html }: Props) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}


export function Sponsorship() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [sponsorTiers, setSponsorTiers] = useState<SponsorTier[]>([]);
  const [boothPackages, setBoothPackages] = useState<BoothPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sponsor dialog state
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SponsorTier | null>(null);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormData>({
    sponsor_name: '',
    tier: '',
    tier_name: '',
    amount: 0,
    event: eventId || '',
    company: '',
    company_logo: null
  });
  const [isSubmittingSponsor, setIsSubmittingSponsor] = useState(false);

  // Booth dialog state
  const [boothDialogOpen, setBoothDialogOpen] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothPackage | null>(null);
  const [boothForm, setBoothForm] = useState<BoothFormData>({
    exhibitor_name: '',
    email: '',
    phone: '',
    logo: null,
    website: '',
    event: eventId || '',
    booth_package: '',
    package_name: '',
    price: 0,
    notes: ''
  });
  const [isSubmittingBooth, setIsSubmittingBooth] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);

        // Fetch event details, sponsor tiers, and booth packages in parallel
        const [eventRes, sponsorTiersRes, boothPackagesRes] = await Promise.all([
          eventsAPI.getById(eventId),
          eventsAPI.getSponsorTiers(eventId),
          eventsAPI.getBoothPackages(eventId)
        ]);

        const eventData = eventRes.data.message || null;
        setEvent(eventData);

        const tiersData = sponsorTiersRes.data.message || [];
        setSponsorTiers(Array.isArray(tiersData) ? tiersData : []);

        const boothsData = boothPackagesRes.data.message || [];
        setBoothPackages(Array.isArray(boothsData) ? boothsData : []);

      } catch (err) {
        console.error('Failed to fetch event data:', err);
        setError('Failed to load event data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleOpenSponsorDialog = (tier: SponsorTier) => {
    setSelectedTier(tier);
    setSponsorForm({
      sponsor_name: '',
      tier: tier.name,
      tier_name: tier.tier_name,
      amount: tier.amount,
      event: eventId || '',
      company: '',
      company_logo: null
    });
    setSponsorDialogOpen(true);
  };

  const handleOpenBoothDialog = (booth: BoothPackage) => {
    setSelectedBooth(booth);
    setBoothForm({
      exhibitor_name: '',
      email: '',
      phone: '',
      logo: null,
      website: '',
      event: eventId || '',
      booth_package: booth.name,
      package_name: booth.package_name,
      price: booth.price,
      notes: ''
    });
    setBoothDialogOpen(true);
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setIsSubmittingSponsor(true);
    try {
      const formData = new FormData();
      formData.append('event', eventId);
      formData.append('sponsor_name', sponsorForm.sponsor_name);
      formData.append('company', sponsorForm.company);
      formData.append('tier', sponsorForm.tier);
      formData.append('tier_name', sponsorForm.tier_name);
      formData.append('amount', sponsorForm.amount.toString());

      if (sponsorForm.company_logo) {
        formData.append('company_logo', sponsorForm.company_logo[0]);
      }

      await eventsAPI.createSponsor(formData as any);
      setSponsorDialogOpen(false);
      setSponsorForm({
        sponsor_name: '',
        tier: '',
        tier_name: '',
        amount: 0,
        event: eventId || '',
        company: '',
        company_logo: null
      });
    } catch (error) {
      console.error('Failed to submit sponsor form:', error);
    } finally {
      setIsSubmittingSponsor(false);
    }
  };

  const handleBoothSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setIsSubmittingBooth(true);
    try {
      const formData = new FormData();
      formData.append('event', eventId);
      formData.append('exhibitor_name', boothForm.exhibitor_name);
      formData.append('email', boothForm.email);
      formData.append('phone', boothForm.phone);
      formData.append('website', boothForm.website);
      formData.append('booth_package', boothForm.booth_package);
      formData.append('package_name', boothForm.package_name);
      formData.append('price', boothForm.price.toString());
      formData.append('notes', boothForm.notes);

      if (boothForm.logo) {
        formData.append('logo', boothForm.logo[0]);
      }

      await eventsAPI.createExhibitor(formData as any);
      setBoothDialogOpen(false);
      setBoothForm({
        exhibitor_name: '',
        email: '',
        phone: '',
        logo: null,
        website: '',
        event: eventId || '',
        booth_package: '',
        package_name: '',
        price: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Failed to submit booth form:', error);
    } finally {
      setIsSubmittingBooth(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600 dark:text-red-400">{error || 'Event not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sponsorship & Exhibition</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {event.host_name} - Partner with us or secure a booth
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sponsorship Tiers */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="size-6 text-blue-600" />
                <CardTitle>Sponsorship Tiers</CardTitle>
              </div>
              <CardDescription>
                Choose a sponsorship tier that best fits your brand and budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sponsorTiers.length > 0 ? (
                <div className="space-y-4">
                  {sponsorTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{tier.tier_name}</h3>
                          <p className="text-2xl font-bold text-blue-600">
                            {tier.currency} {tier.amount.toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            tier.tier_name?.toLowerCase() === 'platinum'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                              : tier.tier_name?.toLowerCase() === 'gold'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white'
                          }
                        >
                          {tier.tier_name}
                        </Badge>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <HtmlRenderer html={tier.description} />
                        </p>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => handleOpenSponsorDialog(tier)}
                      >
                        <Building2 className="size-4 mr-2" />
                        Become a {tier.tier_name} Sponsor
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No sponsorship tiers available for this event.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booth Packages */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="size-6 text-sky-600" />
                <CardTitle>Booth Packages</CardTitle>
              </div>
              <CardDescription>
                Secure a booth to showcase your products and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {boothPackages.length > 0 ? (
                <div className="space-y-4">
                  {boothPackages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="border rounded-lg p-4 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.package_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Size: {pkg.booth_size}
                          </p>
                          <p className="text-2xl font-bold text-sky-600">
                            {pkg.currency} {pkg.price.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-sky-500 text-white">
                          {pkg.available_booths} available
                        </Badge>
                      </div>

                      {/* Package features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.includes_passes > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {pkg.includes_passes} Passes
                          </Badge>
                        )}
                        {pkg.includes_power && (
                          <Badge variant="outline" className="text-xs">
                            Power Included
                          </Badge>
                        )}
                        {pkg.includes_internet && (
                          <Badge variant="outline" className="text-xs">
                            Internet Included
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleOpenBoothDialog(pkg)}
                      >
                        <Store className="size-4 mr-2" />
                        Request This Booth
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Store className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No booth packages available for this event.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sponsor Dialog */}
      <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Become a {selectedTier?.tier_name} Sponsor</DialogTitle>
            <DialogDescription>
              Fill out the form below to apply for {selectedTier?.tier_name} sponsorship.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSponsorSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sponsor_name">Sponsor Name *</Label>
                <Input
                  id="sponsor_name"
                  value={sponsorForm.sponsor_name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsor_name: e.target.value })}
                  placeholder="Enter sponsor name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={sponsorForm.company}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, company: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tier">Sponsor Tier</Label>
                <Input
                  id="tier"
                  value={selectedTier?.tier_name || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={`${selectedTier?.currency} ${selectedTier?.amount.toLocaleString() || 0}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company_logo">Company Logo</Label>
                <Input
                  id="company_logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSponsorForm({ ...sponsorForm, company_logo: e.target.files && e.target.files.length > 0 ? e.target.files : null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmittingSponsor}>
                {isSubmittingSponsor ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booth Dialog */}
      <Dialog open={boothDialogOpen} onOpenChange={setBoothDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request a Booth</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a booth at this event.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBoothSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exhibitor_name">Exhibitor Name *</Label>
                <Input
                  id="exhibitor_name"
                  value={boothForm.exhibitor_name}
                  onChange={(e) => setBoothForm({ ...boothForm, exhibitor_name: e.target.value })}
                  placeholder="Enter exhibitor name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={boothForm.email}
                    onChange={(e) => setBoothForm({ ...boothForm, email: e.target.value })}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={boothForm.phone}
                    onChange={(e) => setBoothForm({ ...boothForm, phone: e.target.value })}
                    placeholder="Enter phone"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={boothForm.website}
                  onChange={(e) => setBoothForm({ ...boothForm, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="package_name">Booth Package</Label>
                <Input
                  id="package_name"
                  value={selectedBooth?.package_name || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={`${selectedBooth?.currency} ${selectedBooth?.price.toLocaleString() || 0}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBoothForm({ ...boothForm, logo: e.target.files && e.target.files.length > 0 ? e.target.files : null })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={boothForm.notes}
                  onChange={(e) => setBoothForm({ ...boothForm, notes: e.target.value })}
                  placeholder="Any special requirements or notes"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmittingBooth}>
                {isSubmittingBooth ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
