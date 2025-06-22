"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Link, DollarSign, LogOut, Clock, CheckCircle2, History, RefreshCw, Users, Copy } from "lucide-react"
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import NotificationsDropdown from "./notifications-dropdown"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import vaultAbi from "@/lib/abi/SikaVault.json"
import type { Vault as VaultType } from "@/app/page"

interface VaultDetailsProps {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
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

export default function VaultDetails({
  provider,
  signer,
  vaultId,
  currency,
  onBack,
  onDisconnect,
  onNavigateToSettings,
  onToggleNotifications,
  showNotifications,
  onOpenDeposit
}: VaultDetailsProps) {
  const [vault, setVault] = useState<VaultType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchVaultDetails = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const vaultContract = new ethers.Contract(vaultId, vaultAbi.abi, provider);
      const [currentCycle, totalPot, nextPayoutTime] = await vaultContract.getVaultState();
      const [token, contributionAmount, , membersCount, isTerminated] = await vaultContract.getVaultConfiguration();
      
      const memberAddresses: string[] = [];
      for (let j = 0; j < membersCount; j++) {
        memberAddresses.push(await vaultContract.members(j));
      }

      const payoutOrder = [];
      for (let j = 0; j < membersCount; j++) {
        payoutOrder.push(Number(await vaultContract.payoutOrder(j)));
      }

      const nextRecipientIndex = payoutOrder[Number(currentCycle)];
      const nextRecipient = memberAddresses[nextRecipientIndex];
      
      const target = BigInt(contributionAmount) * BigInt(membersCount);
      const daysLeft = Math.ceil((Number(nextPayoutTime) * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

      setVault({
        id: vaultId,
        name: `Savings Vault #${vaultId.slice(0, 6)}`, // Using address slice as a name
        collected: totalPot,
        target: target.toString(),
        members: memberAddresses,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        status: isTerminated ? "Terminated" : "Active",
        contributionAmount: contributionAmount,
        nextRecipient: nextRecipient
      });
    } catch (error) {
      console.error("Failed to fetch vault details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVaultDetails();
  }, [provider, vaultId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading Vault Details...</p>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Vault not found.</p>
        <Button onClick={onBack} className="ml-4">Go Back</Button>
      </div>
    );
  }

  const progress = BigInt(vault.target) > 0 ? Number((BigInt(vault.collected) * BigInt(100)) / BigInt(vault.target)) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-gray-600 hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-forest-600">{vault.name}</h1>
        <Button onClick={fetchVaultDetails} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-200">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid md:grid-cols-3 gap-6 p-4 sm:p-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Pot</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4 pt-6">
                <div className="text-4xl font-bold text-forest-600">
                  {ethers.formatUnits(vault.collected, 18)}
                  <span className="text-2xl text-gray-500"> / {ethers.formatUnits(vault.target, 18)} USDC</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="w-full space-y-2 pt-4">
                  <p className="text-lg"><strong>Your Contribution:</strong> {ethers.formatUnits(vault.contributionAmount || 0, 18)} USDC</p>
                  <Button onClick={onOpenDeposit} className="w-full bg-green-600 hover:bg-green-700">Deposit Funds</Button>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-2xl bg-forest-500 text-white">{vault.nextRecipient?.slice(0,1)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-mono">{vault.nextRecipient}</p>
                  <p className="text-gray-600">Payout in {vault.daysLeft} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Group Members</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {vault.members.map((member, index) => (
                  <li key={index} className="flex items-center space-x-3 text-sm">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-300">{member.slice(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className="font-mono">{`${member.slice(0, 8)}...${member.slice(-6)}`}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
