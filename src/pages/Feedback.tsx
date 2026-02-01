import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { eventsAPI } from '../services/api';

interface Event {
    id: string;
    name: string;
    bannerImage: string;
    startDate: string;
    endDate: string;
    venue: string;
    organizer: string;
    ticketType: 'Regular' | 'VIP';
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    qrCode: string;
}

interface FeedbackForm {
    rating: number;
    overallExperience: number;
    contentQuality: number;
    organization: number;
    venue: number;
    comments: string;
}

export function Feedback() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackForm>({
        rating: 0,
        overallExperience: 0,
        contentQuality: 0,
        organization: 0,
        venue: 0,
        comments: '',
    });

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;

            try {
                setIsLoading(true);
                const response = await eventsAPI.getById(eventId);
                setEvent(response.data.message || null);
            } catch (err) {
                console.error('Failed to fetch event:', err);
                setError('Failed to load event data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

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

    const isPastOrOngoing = event.status === 'Completed' || event.status === 'Ongoing';

    if (!isPastOrOngoing) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <CardContent>
                        <ThumbsUp className="size-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Feedback Not Available</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Feedback for this event will be available after the event has completed.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const renderStars = (
        value: number,
        onChange: (value: number) => void,
        label: string
    ) => (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-32">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-1 hover:scale-110 transition-transform"
                    >
                        <Star
                            className={`size-6 ${star <= value
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}
                        />
                    </button>
                ))}
            </div>
            <span className="text-sm text-gray-500 w-16">
                {value > 0 ? `${value}/5` : 'Rate'}
            </span>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // await eventsAPI.submitFeedback(eventId!, feedback);
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <CardContent>
                        <ThumbsUp className="size-12 mx-auto text-green-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Thank You for Your Feedback!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Your feedback helps us improve future events.
                        </p>
                        <Button onClick={() => setSubmitted(false)} variant="outline">
                            Submit Another Response
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Event Feedback</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Share your experience from {event.name}
                </p>
                <Badge
                    className={
                        event.status === 'Completed'
                            ? 'bg-green-500/10 text-green-700'
                            : 'bg-blue-500/10 text-blue-700'
                    }
                >
                    {event.status}
                </Badge>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Rate Your Experience</h3>

                            {renderStars(feedback.rating, (v) => setFeedback({ ...feedback, rating: v }), 'Overall Rating')}
                            {renderStars(feedback.overallExperience, (v) => setFeedback({ ...feedback, overallExperience: v }), 'Experience')}
                            {renderStars(feedback.contentQuality, (v) => setFeedback({ ...feedback, contentQuality: v }), 'Content Quality')}
                            {renderStars(feedback.organization, (v) => setFeedback({ ...feedback, organization: v }), 'Organization')}
                            {renderStars(feedback.venue, (v) => setFeedback({ ...feedback, venue: v }), 'Venue')}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Additional Comments</h3>
                            <Textarea
                                placeholder="Tell us more about your experience, suggestions for improvement, or any other feedback..."
                                value={feedback.comments}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback({ ...feedback, comments: e.target.value })}
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => setFeedback({
                                rating: 0,
                                overallExperience: 0,
                                contentQuality: 0,
                                organization: 0,
                                venue: 0,
                                comments: '',
                            })}>
                                Reset
                            </Button>
                            <Button type="submit" disabled={feedback.rating === 0 || isSubmitting}>
                                <Send className="size-4 mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
