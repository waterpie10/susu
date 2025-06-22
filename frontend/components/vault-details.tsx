"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Link, DollarSign, LogOut, Clock, CheckCircle2, History } from "lucide-react"
import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import NotificationsDropdown from "./notifications-dropdown"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import vaultAbi from "@/lib/abi/SikaVault.json"
import factoryAbi from "@/lib/abi/SikaVaultFactory.json";

const SIKA_VAULT_FACTORY_ADDRESS = "0xaC1507f25385f6d52E4DcfA12e4a0136dCAA6D51";

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
  onOpenDeposit: (vaultId: string, contributionAmount: ethers.BigNumberish) => void
}

interface MemberStatus {
  address: string;
  payoutDate: string; // This will be a formatted string
  status: 'Paid' | 'Current' | 'Queued';
  contributionStatus: 'Contributed' | 'Outstanding';
}

interface Activity {
  text: string;
  time: string; // Using a simple string for now
  blockNumber: number;
}

export default function VaultDetails({
  provider,
  signer,
  vaultId,
  onBack,
  onOpenDeposit,
  onDisconnect
}: VaultDetailsProps) {
  const [rotationSchedule, setRotationSchedule] = useState<MemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vaultName, setVaultName] = useState("");
  const [totalPot, setTotalPot] = useState(BigInt(0));
  const [targetPot, setTargetPot] = useState(BigInt(0));
  const [userContribution, setUserContribution] = useState(BigInt(0));
  const [payoutFrequency, setPayoutFrequency] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isActivityVisible, setIsActivityVisible] = useState(true);
  
  const fetchVaultDetails = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const vaultContract = new ethers.Contract(vaultId, vaultAbi.abi, provider);
      const [currentCycle, fetchedTotalPot, nextPayoutTime] = await vaultContract.getVaultState();
      const [, fetchedContribution, interval, membersCount, ] = await vaultContract.getVaultConfiguration();
      
      const memberAddresses: string[] = [];
      for (let j = 0; j < membersCount; j++) {
        memberAddresses.push(await vaultContract.members(j));
      }

      const payoutOrder: number[] = [];
      for (let j = 0; j < membersCount; j++) {
        payoutOrder.push(Number(await vaultContract.payoutOrder(j)));
      }

      const schedule: MemberStatus[] = [];
      const payoutIntervalSeconds = Number(interval);
      let currentPayoutTimestamp = Number(nextPayoutTime);

      // We need to reconstruct payout dates from the *next* payout time
      // First, find the timestamp of the *first* payout to establish a baseline
      const firstPayoutTimestamp = currentPayoutTimestamp - (Number(currentCycle) * payoutIntervalSeconds);

      for (let i = 0; i < membersCount; i++) {
        const memberIndex = payoutOrder[i];
        const memberAddress = memberAddresses[memberIndex];
        const hasPaid = await vaultContract.hasMemberPaidForCycle(memberAddress, currentCycle);
        const payoutDate = new Date((firstPayoutTimestamp + (i * payoutIntervalSeconds)) * 1000);
        
        let status: 'Paid' | 'Current' | 'Queued' = 'Queued';
        if (i < currentCycle) {
          status = 'Paid';
        } else if (i === Number(currentCycle)) {
          status = 'Current';
        }

        schedule.push({
          address: memberAddress,
          payoutDate: payoutDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: status,
          contributionStatus: hasPaid ? 'Contributed' : 'Outstanding',
        });
      }

      setRotationSchedule(schedule);
      setVaultName(`Savings Vault #${vaultId.slice(0, 6)}`);
      setTotalPot(fetchedTotalPot);
      setTargetPot(BigInt(fetchedContribution) * BigInt(membersCount));
      setUserContribution(fetchedContribution);
      setPayoutFrequency(payoutIntervalSeconds === 604800 ? "Weekly" : payoutIntervalSeconds === 2592000 ? "Monthly" : "Quarterly");
      
      const lastPayoutTimestamp = firstPayoutTimestamp + ((membersCount - 1) * payoutIntervalSeconds);
      const expiry = new Date(lastPayoutTimestamp * 1000);
      setExpiryDate(expiry.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

      // --- Fetch Events for Activity Feed ---
      const factory = new ethers.Contract(SIKA_VAULT_FACTORY_ADDRESS, factoryAbi.abi, provider);
      const creationFilter = factory.filters.VaultCreated(vaultId);
      const creationEvents = await factory.queryFilter(creationFilter, 0, 'latest');
      
      const depositEvents = await vaultContract.queryFilter('Deposit', 0, 'latest');
      const payoutEvents = await vaultContract.queryFilter('PayoutExecuted', 0, 'latest');
      
      let allActivities: Activity[] = [];

      if (creationEvents.length > 0) {
        const block = await provider.getBlock(creationEvents[0].blockNumber);
        if (block) {
            allActivities.push({
                text: "Vault created successfully.",
                time: new Date(block.timestamp * 1000).toLocaleString(),
                blockNumber: creationEvents[0].blockNumber
            });
        }
      }

      for (const event of depositEvents) {
          const block = await provider.getBlock(event.blockNumber);
          if (block) {
              const args = (event as ethers.EventLog).args;
              allActivities.push({
                  text: `${args.member.slice(0,6)}... deposited ${ethers.formatUnits(args.amount, 18)} USDC.`,
                  time: new Date(block.timestamp * 1000).toLocaleString(),
                  blockNumber: event.blockNumber
              });
          }
      }

      for (const event of payoutEvents) {
          const block = await provider.getBlock(event.blockNumber);
          if (block) {
              const args = (event as ethers.EventLog).args;
              allActivities.push({
                  text: `Payout of ${ethers.formatUnits(args.amount, 18)} USDC executed to ${args.recipient.slice(0,6)}...`,
                  time: new Date(block.timestamp * 1000).toLocaleString(),
                  blockNumber: event.blockNumber
              });
          }
      }
      
      allActivities.sort((a, b) => b.blockNumber - a.blockNumber);
      setActivities(allActivities);
      
    } catch (error) {
      console.error("Failed to fetch vault details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchVaultDetails();
  }, [provider, vaultId]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading Vault Details...</p></div>;
  }

  const nextPayoutUser = rotationSchedule.find(member => member.status === 'Current');
  const outstandingContributions = rotationSchedule.filter(m => m.contributionStatus === 'Outstanding').length;
  const percentage = targetPot > 0 ? Number((totalPot * BigInt(100)) / targetPot) : 0;
  
  return (
    <div className="min-h-screen bg-white text-gray-900 flex relative">
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        {/* Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center"><Link className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-gray-800">SikaChain</span>
          </div>
        </div>
        <nav className="flex-1 p-4"><Button onClick={onBack} variant="ghost" className="w-full justify-start mb-4 text-gray-600 hover:text-gray-700 hover:bg-gray-200"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button></nav>
        <div className="p-4 border-t border-gray-200">
          <Button onClick={onDisconnect} variant="outline" size="sm" className="w-full bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-700"><LogOut className="w-4 h-4 mr-2" />Disconnect</Button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className={`grid ${isActivityVisible ? 'grid-cols-2' : 'grid-cols-1'} gap-8 h-full`}>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{vaultName}</h1>
                <Button onClick={() => setIsActivityVisible(!isActivityVisible)} variant="outline" size="icon">
                  <History className="w-5 h-5" />
                </Button>
              </div>
              <Card className="bg-white border-gray-200 shadow-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-forest-500 mb-4">Total Pot</h3>
                      <div className="w-48 h-48 mx-auto">
                        <CircularProgressbarWithChildren value={percentage} styles={buildStyles({ pathColor: "#3A5A40", trailColor: "#DAD7CD" })}>
                          <div className="text-center text-[#344E41]">
                            <div className="font-bold text-lg">{`${ethers.formatUnits(totalPot, 18)} / ${ethers.formatUnits(targetPot, 18)}`}</div>
                            <div className="text-sm">USDC</div>
                          </div>
                        </CircularProgressbarWithChildren>
                      </div>
                      <div className="pt-4"><p className="text-gray-600"><span className="font-bold text-orange-500">{outstandingContributions}</span> outstanding contribution{outstandingContributions === 1 ? "" : "s"}.</p></div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <Card className="bg-gray-50 p-4 h-full">
                        <CardContent className="space-y-4 flex flex-col justify-between h-full">
                          <div className="flex items-center justify-between"><span className="text-gray-600">Your Contribution:</span><div className="font-bold text-forest-500">{ethers.formatUnits(userContribution, 18)} USDC</div></div>
                          <div className="flex items-center justify-between"><span className="text-gray-600">Payout Frequency:</span><span className="font-medium text-gray-800">{payoutFrequency}</span></div>
                          <div className="flex items-center justify-between"><span className="text-gray-600">Vault Contract Expiring:</span><span className="font-medium text-gray-800">{expiryDate}</span></div>
                        </CardContent>
                      </Card>
                      <Button className="w-full bg-forest-500 hover:bg-forest-600 text-white py-3 mt-4" onClick={() => onOpenDeposit(vaultId, userContribution)}><DollarSign className="w-5 h-5 mr-2" />Deposit Funds</Button>
                    </div>
                  </div>
                </CardContent>
                {nextPayoutUser && (
                  <>
                    <CardHeader className="border-t"><CardTitle className="text-forest-500">Next Payout</CardTitle></CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Avatar className="w-12 h-12"><AvatarFallback className="bg-forest-500 text-white text-xl">{nextPayoutUser.address[2]}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-bold text-lg text-gray-800 font-mono">{nextPayoutUser.address}</div>
                          <p className="text-gray-600">Payout on <span className="font-medium text-gray-800">{nextPayoutUser.payoutDate}</span></p>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
                <CardHeader className="border-t"><CardTitle className="text-forest-500">Group Members</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rotationSchedule.map((member, index) => (
                      <Card key={index} className={`p-4 bg-gray-50 ${member.status === "Current" ? "border-2 border-forest-500" : ""}`}>
                        <div className="flex items-center justify-between mb-3">
                          <Avatar className="w-12 h-12 border-2 border-white"><AvatarFallback className="bg-forest-500 text-white text-lg">{member.address[2]}</AvatarFallback></Avatar>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>{member.status === 'Paid' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Clock className="w-6 h-6 text-gray-400" />}</TooltipTrigger>
                              <TooltipContent><p>Payout {member.status}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="mb-3">
                          <div className="font-bold text-gray-800 font-mono text-sm">{`${member.address.slice(0, 6)}...${member.address.slice(-4)}`}</div>
                          <div className="text-xs text-gray-500">Payout on {member.payoutDate}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-600 mb-1">Current cycle:</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.contributionStatus === "Contributed" ? "bg-green-500/20 text-green-600" : "bg-orange-500/20 text-orange-600"}`}>{member.contributionStatus}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {isActivityVisible && (
             <div>
               <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Activity</h2>
               <Card className="bg-white border-gray-200 h-[600px] shadow-md">
                 <CardContent className="p-0">
                   <ScrollArea className="h-full p-6">
                     <div className="space-y-4">
                       {activities.map((activity, index) => (
                         <div key={index} className="border-l-2 border-forest-500 pl-4 pb-4">
                           <div className="text-sm text-gray-700 mb-1">{activity.text}</div>
                           <div className="text-xs text-gray-500">{activity.time}</div>
                         </div>
                       ))}
                     </div>
                   </ScrollArea>
                 </CardContent>
               </Card>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
