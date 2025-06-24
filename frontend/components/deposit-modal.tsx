"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import vaultAbi from "@/lib/abi/SikaVault.json"
import erc20Abi from "@/lib/abi/MockERC20.json" // A generic ERC20 ABI is fine

// This needs to be the address of the token the vault uses
const MOCK_TOKEN_ADDRESS = "0x47cDfC0798C2f406eFAA8f5671Bf69C9212Ae891";

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
      const tokenContract = new ethers.Contract(MOCK_TOKEN_ADDRESS, erc20Abi.abi, signer);

      setStatus("Approving...");
      
      // Check current allowance first
      const currentAllowance = await tokenContract.allowance(await signer.getAddress(), vaultId);
      if (currentAllowance < contributionAmount) {
        const approveTx = await tokenContract.approve(vaultId, contributionAmount, { gasLimit: 100000 });
        await approveTx.wait();
      }

      setStatus("Depositing...");
      const depositTx = await vaultContract.deposit({ gasLimit: 200000 });
      const receipt = await depositTx.wait();
      
      setStatus("Success!");
      console.log("Deposit successful! Transaction hash:", receipt.hash);
      onConfirm();

    } catch (error) {
      console.error("Deposit failed:", error);
      alert("Deposit failed: See console window for details");
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
          <p>You are about to deposit <span className="font-bold">{ethers.formatUnits(contributionAmount, 18)} MTK</span> into the vault.</p>
          <p className="text-sm text-gray-500">This requires two transactions: one to approve the token transfer and one to deposit.</p>
          
          <Button onClick={handleDeposit} disabled={isDepositing} className="w-full">
            {isDepositing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDepositing ? status : `Confirm Deposit`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
