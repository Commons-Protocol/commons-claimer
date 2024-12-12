"use client";

import React, { useEffect, useState } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Coins, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { celo } from "wagmi/chains";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

import { rewardConfig } from "@/abis/reward";
import { formatTime, formatTokenAmount, TOKEN_ADDRESS } from "@/utils";

export default function CommonsTokenClaimPage() {
  const [tokenPrice, setTokenPrice] = useState(null);

  const { toast } = useToast();
  const account = useAccount();
  const { data: hash, writeContract } = useWriteContract();

  const countdownTime = useReadContract({
    abi: rewardConfig.abi,
    address: rewardConfig.address as `0x${string}`,
    functionName: "timeUntilNextClaim",
    args: [account.address as `0x${string}`],
    query: {
      refetchInterval: 1,
    },
  });

  const canClaim = useReadContract({
    abi: rewardConfig.abi,
    address: rewardConfig.address as `0x${string}`,
    functionName: "canClaimReward",
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

  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    chainId: celo.id,
    hash: hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Tx successfully confirmed",
        description: (
          <div>
            <Link
              href="https://app.ubeswap.org/#/stakes/0x8585A611521717Ffe7d93cF264DbE936E484DBa0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Go to staking on Ubeswap
            </Link>
          </div>
        ),
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

  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 p-4">
        <br />
        <Card className="w-[350px]">
          <CardHeader className="text-center items-center">
            <CardTitle>Commons Builder Income</CardTitle>
            <CardDescription>
              <b>You can claim 10 $COMMONS per day</b>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.isConnected && (
              <div className="text-center mb-4">
                <p
                  className="font-bold text-sm"
                  style={{ color: "#777777", marginTop: "20px" }}
                >
                  Your Balance
                </p>
                <p className="text-lg" style={{ marginBottom: "40px" }}>
                  <b>{`${formatTokenAmount(
                    tokenBalance.data?.value!,
                    tokenBalance.data?.decimals!
                  )}`}</b>
                  {` $COMMONS`}
                </p>
                {tokenPrice !== null ? (
                  <p className="text-sm text-gray-500">
                    ($
                    {(
                      Number(
                        formatTokenAmount(
                          tokenBalance.data?.value!,
                          tokenBalance.data?.decimals!
                        )
                      ) * tokenPrice
                    ).toFixed(2)}
                    USD)
                  </p>
                ) : (
                  ""
                )}
              </div>
            )}
            {account.isConnected &&
              tokenBalance.data &&
              tokenBalance.data.value > BigInt(0) && (
                <Alert>
                  <AlertTitle>Earn extra rewards</AlertTitle>
                  <AlertDescription>
                    Get additional income by staking your COMMONS tokens.
                    <Link
                      href="https://app.ubeswap.org/#/stakes/0x8585A611521717Ffe7d93cF264DbE936E484DBa0"
                      className="font-medium underline underline-offset-4"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <br />
                      <br />
                      Stake on Ubeswap
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            {!whitelisted.data && (
              <Button
                style={{
                  padding: "25px 15px",
                  marginTop: "40px",
                  borderRadius: "15px",
                }}
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdX2KEoikI8g2XR8LSuG_7AuVq9ThD_dJCUutvKcUczWDUSkQ/viewform?usp=sf_link">
                  Apply to join the commons community
                </a>
              </Button>
            )}
            {whitelisted.data && (
              <Button
                onClick={() =>
                  writeContract(
                    {
                      abi: rewardConfig.abi,
                      address: rewardConfig.address as `0x${string}`,
                      functionName: "claimReward",
                    },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Success",
                          description: "tx sent successfully.",
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
                  )
                }
                className="w-full"
                disabled={isLoading || !account.isConnected || !canClaim.data}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                  <Coins className="mr-2 h-4 w-4" />
                )}
                {!canClaim.data
                  ? "Patience, young commoner"
                  : "Claim 10 $COMMONS"}
              </Button>
            )}
            {whitelisted.data && (
              <div className="text-center items-center">
                <p className="font-bold">Next Claim In</p>
                <p className="text-xl">
                  {account.isConnected
                    ? formatTime(Number(countdownTime.data))
                    : "--------"}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <CardDescription className="text-xs text-center">
              Commons protocol is a community-driven initiative designed to
              incentivize the sustainable development and protection of shared
              resources/commons. It aims to create systems that restore,
              regenerate, and replenish the natural and social capital.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
