import './globals.css';
import 'swiper/css';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

export const metadata = {
  title: "CineStats - All Movies Collection in One Place",
  description: "Movies collection, reviews, ratings, and more. Discover your next favorite film with CineStats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        {/* <link rel="stylesheet" href="/assets/boxicons-2.0.7/css/boxicons.min.css" /> */}
        
      </head>
      <body suppressHydrationWarning>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
