import './globals.css';
import { RarityProvider } from './contexts/RarityContext';

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
          {children}
        </RarityProvider>
      </body>
    </html>
  )
}
