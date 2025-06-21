"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Link, DollarSign, LogOut, AlertTriangle } from "lucide-react"
import NotificationsDropdown from "./notifications-dropdown"

interface VaultDetailsProps {
  vaultId: string
  currency: string
  onBack: () => void
  onDisconnect: () => void
  onNavigateToSettings: () => void
  onToggleNotifications: () => void
  showNotifications: boolean
  onOpenDeposit: () => void
}

const currencyRates = {
  USD: 1,
  GBP: 0.79,
  NGN: 1650,
  KES: 129,
}

const currencySymbols = {
  USD: "$",
  GBP: "£",
  NGN: "₦",
  KES: "KSh",
}

function convertCurrency(amount: number, toCurrency: string): string {
  const converted = amount * currencyRates[toCurrency as keyof typeof currencyRates]
  const symbol = currencySymbols[toCurrency as keyof typeof currencySymbols]

  if (toCurrency === "NGN" || toCurrency === "KES") {
    return `${symbol}${Math.round(converted).toLocaleString()}`
  }
  return `${symbol}${Math.round(converted)}`
}

const vaultData = {
  "1": {
    name: "NYC Apartment Fund",
    totalPot: 500,
    userContribution: 100,
    frequency: "Monthly",
    lockEnd: "June 30, 2025",
    rotationSchedule: [
      { id: "1", name: "Alice", address: "0xab...", payoutDate: "June 30, 2025", status: "Current" },
      { id: "2", name: "Bob", address: "0xcd...", payoutDate: "July 30, 2025", status: "Queued" },
      { id: "3", name: "Charlie", address: "0xef...", payoutDate: "August 30, 2025", status: "Queued" },
      { id: "4", name: "You", address: "0x12...", payoutDate: "September 30, 2025", status: "Queued" },
    ],
    activities: [
      { id: "1", text: "Alice (0xab...) deposited $100 USDC.", time: "2 hours ago" },
      { id: "2", text: "Payout rotation updated - Alice moved to current position.", time: "4 hours ago" },
      { id: "3", text: "Bob (0xcd...) joined the vault.", time: "1 day ago" },
      { id: "4", text: "Charlie (0xef...) deposited $100 USDC.", time: "2 days ago" },
      { id: "5", text: "Vault created successfully.", time: "3 days ago" },
    ],
  },
}

export default function VaultDetails({
  vaultId,
  currency,
  onBack,
  onDisconnect,
  onNavigateToSettings,
  onToggleNotifications,
  showNotifications,
  onOpenDeposit,
}: VaultDetailsProps) {
  const [rotationSchedule, setRotationSchedule] = useState(vaultData["1"].rotationSchedule)
  const [showEmergencyModal, setShowEmergencyModal] = useState<string | null>(null)

  const vault = vaultData[vaultId as keyof typeof vaultData]

  if (!vault) {
    return <div>Vault not found</div>
  }

  const handleEmergencyPayout = (memberId: string) => {
    const member = rotationSchedule.find((m) => m.id === memberId)
    if (member) {
      // Move member to front and update statuses
      const updatedSchedule = [
        { ...member, status: "Current" },
        ...rotationSchedule
          .filter((m) => m.id !== memberId && m.status !== "Current")
          .map((m) => ({ ...m, status: "Queued" })),
        ...rotationSchedule
          .filter((m) => m.status === "Current" && m.id !== memberId)
          .map((m) => ({ ...m, status: "Queued" })),
      ]
      setRotationSchedule(updatedSchedule)
      setShowEmergencyModal(null)
    }
  }

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
        <div className="grid grid-cols-3 gap-8 h-full">
          {/* Column 1: Vault Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-6 text-gray-800">{vault.name}</h1>

              <Card className="bg-white border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-forest-500">Vault Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Pot:</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-800">${vault.totalPot} USDC</div>
                      {currency !== "USD" && (
                        <div className="text-sm text-gray-400">
                          ≈ {convertCurrency(vault.totalPot, currency)} {currency}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Your Contribution:</span>
                    <div className="text-right">
                      <div className="font-bold text-forest-500">${vault.userContribution} USDC</div>
                      {currency !== "USD" && (
                        <div className="text-sm text-gray-400">
                          ≈ {convertCurrency(vault.userContribution, currency)} {currency}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payout Frequency:</span>
                    <span className="font-medium text-gray-800">{vault.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Lock Ends:</span>
                    <span className="font-medium text-gray-800">{vault.lockEnd}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button className="w-full bg-forest-500 hover:bg-forest-600 text-white py-3" onClick={onOpenDeposit}>
              <DollarSign className="w-5 h-5 mr-2" />
              Deposit Funds
            </Button>
          </div>

          {/* Column 2: Payout Rotation Schedule */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Payout Rotation Schedule</h2>

            <Card className="bg-white border-gray-200 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {rotationSchedule.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-forest-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-forest-500 text-white">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-800">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.address}</div>
                          <div className="text-sm text-gray-500">Payout on {member.payoutDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === "Current"
                              ? "bg-green-500/20 text-green-600"
                              : "bg-gray-500/20 text-gray-600"
                          }`}
                        >
                          {member.status}
                        </span>
                        {member.status === "Queued" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowEmergencyModal(member.id)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Request Emergency Payout
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Activity Feed */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Activity</h2>

            <Card className="bg-white border-gray-200 h-[600px] shadow-md">
              <CardContent className="p-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-4">
                    {vault.activities.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-forest-500 pl-4 pb-4">
                        <div className="text-sm text-gray-700 mb-1">{activity.text}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Emergency Payout Confirmation Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Emergency Payout Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to request an emergency payout? This will move you to the front of the queue.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleEmergencyPayout(showEmergencyModal)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Confirm
                </Button>
                <Button onClick={() => setShowEmergencyModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && <NotificationsDropdown onClose={() => onToggleNotifications()} />}
    </div>
  )
}
