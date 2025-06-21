"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign } from "lucide-react"

interface DepositModalProps {
  onClose: () => void
  onConfirm: (amount: number) => void
}

export default function DepositModal({ onClose, onConfirm }: DepositModalProps) {
  const [amount, setAmount] = useState("")

  const handleConfirm = () => {
    const numAmount = Number.parseFloat(amount)
    if (numAmount > 0) {
      onConfirm(numAmount)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 text-gray-900 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Deposit into Vault</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-600 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="amount" className="text-gray-700">
              Amount (USDC)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              className="bg-white border-gray-200 text-gray-900 mt-2"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              disabled={!amount || Number.parseFloat(amount) <= 0}
              className="flex-1 bg-forest-500 hover:bg-forest-600 text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Confirm Deposit
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
