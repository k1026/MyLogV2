import './globals.css';
import { RarityProvider } from './contexts/RarityContext';
import { LocationProvider } from './contexts/LocationContext';

export const metadata = {
  title: 'MyLog V2',
  description: 'Personal lifestyle log with Rarity system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <RarityProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </RarityProvider>
      </body>
    </html>
  )
}
