"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Link, LogOut, User, Sliders } from "lucide-react"
import NotificationsDropdown from "./notifications-dropdown"

interface SettingsProps {
  onBack: () => void
  onDisconnect: () => void
  onNavigateToSettings: () => void
  onToggleNotifications: () => void
  showNotifications: boolean
}

export default function Settings({
  onBack,
  onDisconnect,
  onNavigateToSettings,
  onToggleNotifications,
  showNotifications,
}: SettingsProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">SikaChain</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full justify-start mb-4 text-gray-600 hover:text-gray-700 hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-forest-500 text-white">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">0x1234...abcd</div>
            </div>
          </div>
          <Button
            onClick={onDisconnect}
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <Card className="bg-white border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-forest-500">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Manage your profile information and wallet settings.</p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="bg-white border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-forest-500">
                  <Sliders className="w-5 h-5" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Customize your SikaChain experience and notification preferences.</p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && <NotificationsDropdown onClose={() => onToggleNotifications()} />}
    </div>
  )
}
