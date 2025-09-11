import '../styles/globals.css'
import '../styles/admin-theme.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ToastProvider } from '../components/ToastSystem'
import FavoritesProvider from '../components/FavoritesSystem'
import { CommentsProvider } from '../components/CommentsSystem'
import { AdvertisementProvider } from '../components/AdvertisementSystem'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Zomiga - منصة الترفيه الشاملة</title>
        <meta name="description" content="منصة zomiga الشاملة للقنوات التلفزيونية والألعاب والمقالات والتسويق بالعمولة" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        
        {/* CORS and Security Headers */}
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="unsafe-none" />
        <meta httpEquiv="Cross-Origin-Resource-Policy" content="cross-origin" />
      </Head>
      
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <FavoritesProvider>
              <CommentsProvider>
                <AdvertisementProvider>
                  {/* اجعل الخلفية تستجيب للوضع الداكن */}
                  <div className="bg-gray-50 dark:bg-gray-900" dir="rtl" lang="ar">
                    <Component {...pageProps} />
                  </div>
                </AdvertisementProvider>
              </CommentsProvider>
            </FavoritesProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}