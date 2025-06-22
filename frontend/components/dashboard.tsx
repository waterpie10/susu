"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Vault, Bell, Settings, Link, Clock, Users, LogOut, Plus } from "lucide-react"
import type { Vault as VaultType } from "@/app/page"
import NotificationsDropdown from "./notifications-dropdown"
import factoryAbi from "@/lib/abi/SikaVaultFactory.json";
import vaultAbi from "@/lib/abi/SikaVault.json";

const SIKA_VAULT_FACTORY_ADDRESS = "0xaC1507f25385f6d52E4DcfA12e4a0136dCAA6D51";

interface DashboardProps {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  userAddress: string;
  currency: string
  onCurrencyChange: (currency: string) => void
  onVaultClick: (vaultId: string) => void
  onDisconnect: () => void
  onCreateVault: () => void
  onNavigateToSettings: () => void
  onToggleNotifications: () => void
  showNotifications: boolean
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
  // For MATIC, just format as MATIC
  return `${ethers.formatUnits(BigInt(amount), 18)} MATIC`;
}

export default function Dashboard({
  provider,
  signer,
  userAddress,
  currency,
  onCurrencyChange,
  onVaultClick,
  onDisconnect,
  onCreateVault,
  onNavigateToSettings,
  onToggleNotifications,
  showNotifications,
}: DashboardProps) {
  const [vaults, setVaults] = useState<VaultType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVaults = async () => {
      if (!provider) return;

      setIsLoading(true);
      try {
        const factory = new ethers.Contract(SIKA_VAULT_FACTORY_ADDRESS, factoryAbi.abi, provider);
        const vaultCount = await factory.getDeployedVaultsCount();
        
        const vaultsData: VaultType[] = [];
        for (let i = 0; i < vaultCount; i++) {
          const vaultAddress = await factory.deployedVaults(i);
          const vaultContract = new ethers.Contract(vaultAddress, vaultAbi.abi, provider);

          const [currentCycle, totalPot, nextPayoutTime] = await vaultContract.getVaultState();
          const [, contributionAmount, , membersCount, ] = await vaultContract.getVaultConfiguration();
          
          const memberAddresses: string[] = [];
          for (let j = 0; j < membersCount; j++) {
            const memberAddress = await vaultContract.members(j);
            memberAddresses.push(memberAddress);
          }

          const daysLeft = Math.ceil((Number(nextPayoutTime) - Date.now() / 1000) / (24 * 60 * 60));
          const target = BigInt(contributionAmount) * BigInt(membersCount);

          vaultsData.push({
            id: vaultAddress,
            name: `Savings Vault #${i + 1}`, // Placeholder name
            collected: totalPot,
            target: target.toString(),
            members: memberAddresses,
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            status: "Collecting", // Placeholder status
          });
        }
        setVaults(vaultsData);
      } catch (error) {
        console.error("Failed to fetch vaults:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaults();
  }, [provider]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex relative">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">SikaChain</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-forest-500/20 text-forest-600 border-l-4 border-forest-500">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
            </li>
            <li>
              <div
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
                onClick={() => {}} // Already on dashboard
              >
                <Vault className="w-5 h-5" />
                <span>My Vaults</span>
              </div>
            </li>
            <li>
              <div
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
                onClick={onToggleNotifications}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </div>
            </li>
            <li>
              <div
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
                onClick={onNavigateToSettings}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </div>
            </li>
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-forest-500 text-white">{userAddress ? userAddress.slice(0, 1) : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Not Connected"}</div>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-forest-500">Welcome Back!</h1>
          <Button onClick={onCreateVault} className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2">
            <Plus className="w-5 h-5 mr-2" />
            Create a New Vault
          </Button>
        </div>

        {/* Vaults Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-forest-500">Your Active Vaults</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Display Currency:</span>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="w-20 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <p>Loading vaults...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault) => (
                <Card
                  key={vault.id}
                  className="bg-white border-gray-200 border-l-4 border-l-forest-500 cursor-pointer hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                  onClick={() => onVaultClick(vault.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{vault.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600`}
                      >
                        {vault.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <div className="text-right">
                          <div className="text-forest-500 font-medium">
                            {ethers.formatUnits(vault.collected, 18)} / {ethers.formatUnits(vault.target, 18)} MATIC
                          </div>
                          {currency !== "USD" && (
                             <div className="text-xs text-gray-400">
                               ≈ {convertCurrency(Number(ethers.formatUnits(vault.collected, 18)), currency)} / {convertCurrency(Number(ethers.formatUnits(vault.target, 18)), currency)}
                             </div>
                           )}
                        </div>
                      </div>
                      <Progress
                        value={
                          BigInt(vault.target) > 0
                            ? Number((BigInt(vault.collected) * BigInt(100)) / BigInt(vault.target))
                            : 0
                        }
                        className="h-2 bg-gray-200"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {vault.members.map((_, index) => (
                          <Avatar key={index} className="w-8 h-8 border-2 border-white">
                            <AvatarFallback className="bg-forest-500 text-white text-xs">{`M${index+1}`}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Payout in {vault.daysLeft} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && <NotificationsDropdown onClose={() => onToggleNotifications()} />}
    </div>
  )
}
