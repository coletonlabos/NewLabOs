import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CommandBar } from "@/components/CommandBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lab OS",
  description: "Life and Business Operating System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CommandBar />
      </body>
    </html>
  )
} 