import './globals.css'

export const metadata = {
  title: 'HigClipper Studio - AI Viral Video Clipper',
  description: 'Motion intelligence for creators',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060608] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
