"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import vaultAbi from "@/lib/abi/SikaVault.json"
import erc20Abi from "@/lib/abi/MockERC20.json" // A generic ERC20 ABI is fine

// This needs to be the address of the token the vault uses
const MOCK_TOKEN_ADDRESS = "0x0823C9636d37D45B0D3E9b1BF17Bc32644ec0013";

interface DepositModalProps {
  signer: ethers.Signer | null
  vaultId: string
  contributionAmount: ethers.BigNumberish
  onClose: () => void
  onConfirm: () => void
}

export default function DepositModal({ signer, vaultId, contributionAmount, onClose, onConfirm }: DepositModalProps) {
  const [isDepositing, setIsDepositing] = useState(false)
  const [status, setStatus] = useState("idle")

  const handleDeposit = async () => {
    if (!signer) {
      alert("Wallet not connected");
      return;
    }
    
    setIsDepositing(true);
    try {
      const vaultContract = new ethers.Contract(vaultId, vaultAbi.abi, signer);

      setStatus("Depositing...");
      const depositTx = await vaultContract.deposit({ value: ethers.parseEther(ethers.formatUnits(contributionAmount, 18)), gasLimit: 500000 });
      await depositTx.wait();

      setStatus("Success!");
      onConfirm();

    } catch (error) {
      console.error("Deposit failed:", error);
      alert("Deposit failed. Check console for details.");
      setStatus("Error");
    } finally {
      setIsDepositing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You are about to deposit <span className="font-bold">{ethers.formatUnits(contributionAmount, 18)} MATIC</span> into the vault.</p>
          <p className="text-sm text-gray-500">This requires one transaction to deposit.</p>
          
          <Button onClick={handleDeposit} disabled={isDepositing} className="w-full">
            {isDepositing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDepositing ? status : `Confirm Deposit`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
