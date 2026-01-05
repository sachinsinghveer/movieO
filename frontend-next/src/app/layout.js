import './globals.css';
import 'swiper/css';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

export const metadata = {
  title: "MovieApp - Responsive React Movie App",
  description: "Responsive React Movie App with API and Axios.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/boxicons-2.0.7/css/boxicons.min.css" />
      </head>
      <body suppressHydrationWarning>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
