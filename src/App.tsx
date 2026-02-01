import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { router } from './layout/routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
