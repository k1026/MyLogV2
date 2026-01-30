import './globals.css';
import { RarityProvider } from './contexts/RarityContext';
import { LocationProvider } from './contexts/LocationContext';
import { UIStateProvider } from './contexts/UIStateContext';
import { FilterProvider } from './contexts/FilterContext';

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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        <RarityProvider>
          <LocationProvider>
            <UIStateProvider>
              <FilterProvider>
                {children}
              </FilterProvider>
            </UIStateProvider>
          </LocationProvider>
        </RarityProvider>
      </body>
    </html>
  )
}
