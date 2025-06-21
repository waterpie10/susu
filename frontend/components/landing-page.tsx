"use client"

import { Button } from "@/components/ui/button"
import { Wallet, Link } from "lucide-react"

interface LandingPageProps {
  onConnect: () => void
}

export default function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SikaChain</span>
        </div>
        <Button onClick={onConnect} className="bg-forest-500 hover:bg-forest-600 text-white px-6 py-2">
          Connect Wallet
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-between px-6 py-20 max-w-7xl mx-auto">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight text-gray-900">
            Community Savings, Reimagined on the Blockchain.
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Inspired by the tradition of Susu, SikaChain helps you and your friends pool funds securely in a shared
            Smart Vault. Save together, support each other.
          </p>
          <Button
            onClick={onConnect}
            className="bg-forest-500 hover:bg-forest-600 text-white px-8 py-4 text-lg flex items-center space-x-3"
            size="lg"
          >
            <Wallet className="w-6 h-6" />
            <span>Connect Your Wallet to Get Started</span>
          </Button>
        </div>

        {/* 3D Visual Placeholder */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-80 h-80 relative">
              {/* Interconnected blocks visual */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-forest-400 to-forest-600 rounded-lg shadow-lg transform rotate-12 animate-pulse"></div>
              <div className="absolute top-16 right-0 w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-lg transform -rotate-6 animate-pulse delay-300"></div>
              <div className="absolute bottom-16 left-8 w-28 h-28 bg-gradient-to-br from-forest-400 to-forest-600 rounded-lg shadow-lg transform rotate-6 animate-pulse delay-700"></div>
              <div className="absolute bottom-0 right-8 w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-lg transform -rotate-12 animate-pulse delay-1000"></div>

              {/* Connecting lines */}
              <div className="absolute top-10 left-10 w-32 h-0.5 bg-gradient-to-r from-forest-400 to-transparent transform rotate-45 opacity-60"></div>
              <div className="absolute top-32 right-12 w-24 h-0.5 bg-gradient-to-r from-forest-400 to-transparent transform -rotate-45 opacity-60"></div>
              <div className="absolute bottom-32 left-16 w-28 h-0.5 bg-gradient-to-r from-forest-400 to-transparent transform rotate-12 opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
