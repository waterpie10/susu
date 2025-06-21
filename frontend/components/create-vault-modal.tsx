"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ArrowRight, ArrowLeft, Zap } from "lucide-react"

interface CreateVaultModalProps {
  onClose: () => void
  onConfirm: (vaultData: any) => void
}

export default function CreateVaultModal({ onClose, onConfirm }: CreateVaultModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "",
    addresses: "",
  })

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleDeploy = () => {
    onConfirm(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white border-gray-200 text-gray-900 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Create a New Vault</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-600 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step ? "bg-forest-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-0.5 mx-2 ${i < step ? "bg-forest-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Vault Details</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">
                    Vault Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    className="bg-white border-gray-200 text-gray-900 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-gray-700">
                    Contribution Amount (USDC)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    className="bg-white border-gray-200 text-gray-900 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency" className="text-gray-700">
                    Payout Frequency
                  </Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900 mt-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Invite Friends */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Invite Friends</h3>

              <div>
                <Label htmlFor="addresses" className="text-gray-700">
                  Add the Polygon wallet addresses of the friends you want to invite.
                </Label>
                <Textarea
                  id="addresses"
                  value={formData.addresses}
                  onChange={(e) => setFormData({ ...formData, addresses: e.target.value })}
                  placeholder="0x1234567890abcdef1234567890abcdef12345678&#10;0xabcdef1234567890abcdef1234567890abcdef12&#10;0x9876543210fedcba9876543210fedcba98765432"
                  rows={8}
                  className="bg-white border-gray-200 text-gray-900 mt-2 font-mono text-sm"
                />
                <p className="text-sm text-gray-600 mt-2">Enter one wallet address per line</p>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Confirmation</h3>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vault Name:</span>
                    <span className="font-medium text-gray-800">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contribution Amount:</span>
                    <span className="font-medium text-gray-800">{formData.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payout Frequency:</span>
                    <span className="font-medium capitalize text-gray-800">{formData.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Members:</span>
                    <span className="font-medium text-gray-800">
                      {formData.addresses.split("\n").filter((addr) => addr.trim()).length + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-4">
                <p className="text-gold-600 text-sm">
                  <strong>Note:</strong> This will require a transaction and gas fees on the Polygon network.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              className="bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
            >
              {step === 1 ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </>
              )}
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-forest-500 hover:bg-forest-600 text-white"
                disabled={
                  (step === 1 && (!formData.name || !formData.amount || !formData.frequency)) ||
                  (step === 2 && !formData.addresses.trim())
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleDeploy} className="bg-gold-500 hover:bg-gold-600 text-white">
                <Zap className="w-4 h-4 mr-2" />
                Deploy Smart Vault
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
