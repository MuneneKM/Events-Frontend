import { createBrowserRouter } from 'react-router';
import { RootLayout } from './RootLayout';
import { MyEvents } from '../pages/MyEvents';
import { EventOverview } from '../pages/EventOverview';
import { Agenda } from '../pages/Agenda';
import { Speakers } from '../pages/Speakers';
import { Content } from '../pages/Content';
import { Networking } from '../pages/Networking';
import { Merchandise } from '../pages/Merchandise';
import { Profile } from '../pages/Profile';
import { Feedback } from '../pages/Feedback';
import { Booking } from '../pages/Booking';
import { Ticket } from '../pages/Ticket';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Sponsorship } from '../pages/Sponsorship';

export const router = createBrowserRouter([
  {
    path: '/dashboard',
    Component: RootLayout,
    children: [
      { index: true, Component: MyEvents },
      { path: 'event/:eventId', Component: EventOverview },
      { path: 'event/:eventId/feedback', Component: Feedback },
      { path: 'event/:eventId/book', Component: Booking },
      { path: 'event/:eventId/ticket', Component: Ticket },
      { path: 'event/:eventId/sponsorship', Component: Sponsorship },
      { path: 'agenda', Component: Agenda },
      { path: 'speakers', Component: Speakers },
      { path: 'content', Component: Content },
      { path: 'networking', Component: Networking },
      { path: 'merchandise', Component: Merchandise },
      { path: 'profile', Component: Profile },
    ],
  },
  { path: '/register', Component: Register },
  { path: '/login', Component: Login },
]);
