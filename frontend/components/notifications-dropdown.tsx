"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, DollarSign, Users, AlertTriangle } from "lucide-react"

interface NotificationsDropdownProps {
  onClose: () => void
}

const notifications = [
  {
    id: "1",
    type: "deposit",
    title: "New Deposit",
    message: "Alice deposited $100 USDC to NYC Apartment Fund",
    time: "2 hours ago",
    icon: DollarSign,
  },
  {
    id: "2",
    type: "rotation",
    title: "Payout Rotation Updated",
    message: "You're next in line for Emergency Fund payout",
    time: "4 hours ago",
    icon: Users,
  },
  {
    id: "3",
    type: "emergency",
    title: "Emergency Payout Request",
    message: "Bob requested emergency payout for NYC Apartment Fund",
    time: "1 day ago",
    icon: AlertTriangle,
  },
  {
    id: "4",
    type: "deposit",
    title: "Deposit Reminder",
    message: "Monthly contribution due for Vacation Pool",
    time: "2 days ago",
    icon: Bell,
  },
]

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose}>
      <div className="absolute top-16 right-8 w-96" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="space-y-1">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon
                  return (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 bg-forest-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-forest-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800">{notification.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
