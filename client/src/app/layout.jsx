import './globals.css';

export const metadata = {
  title: 'Pixora — Image Converter',
  description: 'Modern image conversion tool. Convert PNG, JPG, WEBP, ICO, AVIF, HEIC, BMP, TIFF, SVG and more.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}