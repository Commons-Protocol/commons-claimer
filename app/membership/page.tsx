"use client";

import React, { useEffect, useState } from "react";

import { Coins, Flame, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { celo } from "wagmi/chains";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { commonsConfig } from "@/abis/commons";
import { nftConfig } from "@/abis/nft";
import { rewardConfig } from "@/abis/reward";
import { formatTokenAmount, TOKEN_ADDRESS } from "@/utils";

export default function CommonsTokenStakingPage() {
  const [stakeAmount, setStakeAmount] = useState("");

  const { toast } = useToast();
  const account = useAccount();
  const { data: hash, writeContract } = useWriteContract();

  const stakedToken = useReadContract({
    abi: nftConfig.abi,
    address: nftConfig.address as `0x${string}`,
    functionName: "stakerToNFT",
    args: [account.address as `0x${string}`],
    query: {
      refetchInterval: 1,
    },
  });

  const whitelisted = useReadContract({
    abi: rewardConfig.abi,
    address: rewardConfig.address as `0x${string}`,
    functionName: "whitelist",
    args: [account.address as `0x${string}`],
    query: {
      refetchInterval: 1,
    },
  });

  const tokenBalance = useBalance({
    address: account.address,
    chainId: celo.id,
    token: TOKEN_ADDRESS as `0x${string}`,
    query: {
      refetchInterval: 1,
    },
  });

  const allowance = useReadContract({
    abi: commonsConfig.abi,
    address: TOKEN_ADDRESS as `0x${string}`,
    functionName: "allowance",
    args: [
      account.address as `0x${string}`,
      nftConfig.address as `0x${string}`,
    ],
    query: {
      refetchInterval: 1,
    },
  });

  const allowanceAvailable =
    allowance && allowance.data ? BigInt(allowance.data as bigint) : BigInt(0);

  const tokenMetadata = useReadContract({
    abi: nftConfig.abi,
    address: nftConfig.address as `0x${string}`,
    functionName: "tokenURI",
    args: [stakedToken.data || BigInt(0)],
    query: {
      refetchInterval: 1,
    },
  });

  const tokenData = tokenMetadata?.data
    ? JSON.parse(atob(tokenMetadata?.data.split(",")[1]))
    : null;

  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    chainId: celo.id,
    hash: hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Tx successfully confirmed",
        description: "Copy",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(`https://celoscan.io/tx/${hash}`);
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
    if (isError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tx failed",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(`https://celoscan.io/tx/${hash}`);
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
  }, [isSuccess, isError, hash, toast]);

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === "") {
      setStakeAmount(value);
    }
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to lock.",
      });
      return;
    }

    const stakeAmountBigInt = parseUnits(stakeAmount, 18);

    if (stakeAmountBigInt > (tokenBalance.data?.value ?? BigInt(0))) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: "You don't have enough tokens to lock this amount.",
      });
      return;
    }

    // @ts-ignore
    if (stakeAmountBigInt > allowanceAvailable) {
      toast({
        variant: "destructive",
        title: "Insufficient allowance",
        description: "Please set allowance before locking.",
      });
      return;
    }

    writeContract(
      {
        abi: nftConfig.abi,
        address: nftConfig.address as `0x${string}`,
        functionName: "stake",
        args: [stakeAmountBigInt],
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Transaction sent successfully.",
          });
          setStakeAmount("");
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: e.message,
          });
        },
      }
    );
  };

  const handleSetAllowance = () => {
    const allowanceAmount = parseUnits(stakeAmount, 18);
    writeContract(
      {
        abi: commonsConfig.abi,
        address: TOKEN_ADDRESS as `0x${string}`,
        functionName: "approve",
        args: [nftConfig.address as `0x${string}`, allowanceAmount],
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Allowance set successfully.",
          });
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: e.message,
          });
        },
      }
    );
  };

  const handleUnstake = () => {
    const tokenId = stakedToken?.data;
    if (!tokenId) {
      return;
    }

    writeContract(
      {
        abi: nftConfig.abi,
        address: nftConfig.address as `0x${string}`,
        functionName: "unstake",
        args: [tokenId],
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Unstake transaction sent successfully.",
          });
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: e.message,
          });
        },
      }
    );
  };

  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <br/>
        <Card className="w-[350px]">
          <CardHeader className="text-center items-center">
            <CardTitle>Membership NFT</CardTitle>
            <CardDescription>
              <b>
                {stakedToken.data && BigInt(stakedToken.data) !== BigInt(0)
                  ? "Manage your locked $COMMONS. The more tokens you lock, and for longer, the more you can benefit from the Commons Community"
                  : "Lock your $COMMONS to access and benefit from some special initiatives and resources from the Commons Community"}
              </b>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.isConnected && (
              <div className="text-center mb-4">
                <p
                  className="font-bold text-sm"
                  style={{ color: "#777777", marginTop: "20px" }}
                >
                  Your Available Balance
                </p>
                <p className="text-lg" style={{ marginBottom: "40px" }}>
                  <b>{`${formatTokenAmount(
                    tokenBalance.data?.value!,
                    tokenBalance.data?.decimals!
                  )}`}</b>
                  {` $COMMONS`}
                </p>
              </div>
            )}
            {stakedToken &&
              stakedToken?.data! > BigInt("0") &&
              tokenData &&
              tokenData.image && (
                <div className="text-center mb-4">
                  <p
                    className="font-bold text-sm"
                    style={{ color: "#777777", marginTop: "20px" }}
                  >
                    Your Staked NFT
                  </p>
                  <div className="mt-2 mb-4">
                    <Image
                      src={tokenData.image}
                      alt="Staked NFT"
                      width={200}
                      height={200}
                      className="rounded-lg mx-auto"
                    />
                  </div>
                  <p className="text-sm">
                    Token ID: {stakedToken?.data?.toString() ?? "unknown"}
                  </p>
                </div>
              )}

            {!whitelisted.data && (
              <Button
                style={{
                  padding: "25px 15px",
                  marginTop: "30px",
                  borderRadius: "15px",
                }}
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdX2KEoikI8g2XR8LSuG_7AuVq9ThD_dJCUutvKcUczWDUSkQ/viewform?usp=sf_link">
                  Apply to join the commons community
                </a>
              </Button>
            )}
            {whitelisted.data && (
              <>
                {stakedToken.data && BigInt(stakedToken.data) !== BigInt(0) ? (
                  <Button
                    onClick={handleUnstake}
                    className="w-full"
                    disabled={isLoading || !account.isConnected}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Flame className="mr-2 h-4 w-4" />
                    )}
                    Unstake $COMMONS
                  </Button>
                ) : (
                  <>
                    <Input
                      type="text"
                      placeholder="Enter amount to stake (up to 4 decimals)"
                      value={stakeAmount}
                      onChange={handleStakeAmountChange}
                      className="w-full"
                    />
                    {parseUnits(stakeAmount || "0", 18) > allowanceAvailable ? (
                      <Button
                        onClick={handleSetAllowance}
                        className="w-full"
                        disabled={isLoading || !account.isConnected}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Set Allowance
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStake}
                        className="w-full"
                        disabled={
                          isLoading || !account.isConnected || !stakeAmount
                        }
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Coins className="mr-2 h-4 w-4" />
                        )}
                        Stake $COMMONS
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>

          <hr
            style={{
              borderTop: "1px solid #9b9c9e",
              margin: "15px 15px 15px 0",
              paddingBottom: "8px",
            }}
          />
          <CardDescription style={{ fontSize: "12px", textAlign: "center" }}>
            Commons protocol is a community-driven initiative designed to
            incentivize the sustainable development and protection of shared
            resources/commons. It aims to create systems that restore,
            regenerate, and replenish the natural and social capital.
          </CardDescription>
        </Card>

        <br />
      </div>
    </main>
  );
}
