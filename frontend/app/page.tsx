"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Inter } from "next/font/google"
import LandingPage from "@/components/landing-page"
import Dashboard from "@/components/dashboard"
import VaultDetails from "@/components/vault-details"
import Settings from "@/components/settings"
import CreateVaultModal from "@/components/create-vault-modal"
import DepositModal from "@/components/deposit-modal"
import NotificationsDropdown from "@/components/notifications-dropdown"

const inter = Inter({ subsets: ["latin"] })

// Keep the Vault type, but it will be populated by contract data
export interface Vault {
  id: string; // This will be the contract address
  name: string; // We may need a way to store/retrieve this
  collected: ethers.BigNumberish;
  target: ethers.BigNumberish;
  members: string[];
  daysLeft: number;
  status: string; // e.g., "Collecting", "Ready for Payout"
  contributionAmount?: ethers.BigNumberish;
  nextRecipient?: string;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [dashboardKey, setDashboardKey] = useState(0); // Add key to force re-render
  const [currentPage, setCurrentPage] = useState<"dashboard" | "vault-details" | "settings">("dashboard")
  const [selectedVault, setSelectedVault] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [currency, setCurrency] = useState("USD")
  // Remove the initial mock data
  const [vaults, setVaults] = useState<Vault[]>([])

  const handleConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const userSigner = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(userSigner);
        setUserAddress(await userSigner.getAddress());
        setIsConnected(true)
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setProvider(null);
    setSigner(null);
    setUserAddress("");
    setCurrentPage("dashboard")
    setSelectedVault(null)
  }

  const handleVaultClick = (vaultId: string) => {
    setSelectedVault(vaultId)
    setCurrentPage("vault-details")
  }

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
    setSelectedVault(null)
  }

  const handleNavigateToSettings = () => {
    setCurrentPage("settings")
  }

  // The handleCreateVault logic will be moved inside CreateVaultModal
  // and will interact with the contract directly.
  const refreshDashboard = () => {
    // This function will now just close the modal.
    // The actual creation is handled within the component.
    setShowCreateModal(false);
    // Force a re-render of the dashboard to fetch new vaults
    setDashboardKey(prevKey => prevKey + 1);
  }

  const handleDeposit = (amount: number) => {
    // This will be moved to VaultDetails
    setShowDepositModal(false)
  }

  if (!isConnected) {
    return (
      <div className={inter.className}>
        <LandingPage onConnect={handleConnect} />
      </div>
    )
  }

  return (
    <div className={inter.className}>
      {currentPage === "dashboard" && (
        <Dashboard
          key={dashboardKey} // Use key to force re-fetch
          provider={provider}
          signer={signer}
          userAddress={userAddress}
          currency={currency}
          onCurrencyChange={setCurrency}
          onVaultClick={handleVaultClick}
          onDisconnect={handleDisconnect}
          onCreateVault={() => setShowCreateModal(true)}
          onNavigateToSettings={handleNavigateToSettings}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
        />
      )}
      {currentPage === "vault-details" && selectedVault && (
        <VaultDetails
          provider={provider}
          signer={signer}
          vaultId={selectedVault}
          currency={currency}
          onBack={handleBackToDashboard}
          onDisconnect={handleDisconnect}
          onNavigateToSettings={handleNavigateToSettings}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
          onOpenDeposit={() => setShowDepositModal(true)}
        />
      )}
      {currentPage === "settings" && (
        <Settings
          onBack={handleBackToDashboard}
          onDisconnect={handleDisconnect}
          onNavigateToSettings={handleNavigateToSettings}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          showNotifications={showNotifications}
        />
      )}
      {showCreateModal && (
        <CreateVaultModal 
          provider={provider}
          signer={signer}
          onClose={() => setShowCreateModal(false)} 
          onConfirm={refreshDashboard} 
        />
      )}
      {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} onConfirm={handleDeposit} />}
      {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
    </div>
  )
}
