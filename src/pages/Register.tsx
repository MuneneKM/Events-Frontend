import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { User, Mail, Lock, Building, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';

interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    job_title: string;
    password: string;
    interests: string[];
}

export function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        password: '',
        confirmPassword: '',
    });
    const [interests, setInterests] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    // Get the redirect path from location state
    const from = (location.state as { from?: string })?.from || '/';

    const allInterests = [
        'AI/ML',
        'Cloud Computing',
        'DevOps',
        'Security',
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Blockchain',
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleInterest = (interest: string) => {
        setInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setIsProcessing(true);

        try {
            const userData: RegisterData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                company: formData.company,
                job_title: formData.job_title,
                password: formData.password,
                interests: interests
            };

            await register(userData);
            setRegistrationComplete(true);
            // Redirect to the page user was trying to access
            navigate('/dashboard');
            setTimeout(() => navigate(from), 2000);
        } catch (error) {
            console.error('Registration failed:', error);
        }
        setIsProcessing(false);
    };

    if (registrationComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="size-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your account has been created successfully. Redirecting you to the event booking page...
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
            <Card className="max-w-2xl w-full">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join thousands of attendees at tech events worldwide
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <User className="size-5 text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        First Name
                                    </label>
                                    <Input
                                        name="first_name"
                                        placeholder="James"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Last Name
                                    </label>
                                    <Input
                                        name="last_name"
                                        placeholder="Mwangi"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Mail className="size-5 text-blue-600" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="james@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        placeholder="254796123456"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Building className="size-5 text-blue-600" />
                                Professional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Company
                                    </label>
                                    <Input
                                        name="company"
                                        placeholder="Acme Inc."
                                        value={formData.company}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Job Title
                                    </label>
                                    <Input
                                        name="job_title"
                                        placeholder="Software Engineer"
                                        value={formData.job_title}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Interests */}
                        <div>
                            <h3 className="font-semibold mb-4">Areas of Interest</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Select topics you'd like to receive updates about
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {allInterests.map((interest) => (
                                    <Badge
                                        key={interest}
                                        variant={interests.includes(interest) ? 'default' : 'outline'}
                                        className={`cursor-pointer px-3 py-1 ${interests.includes(interest)
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-blue-50 dark:hover:bg-blue-900'
                                            }`}
                                        onClick={() => toggleInterest(interest)}
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Lock className="size-5 text-blue-600" />
                                Security
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Password
                                    </label>
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                        Confirm Password
                                    </label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <input type="checkbox" id="terms" className="mt-1" required />
                            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                            {isProcessing ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
