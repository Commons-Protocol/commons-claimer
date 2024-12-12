"use client";
import React, { useEffect } from "react";

import { DooglyTippingButton } from "@doogly/doogly-donate-component";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "ethers";
import request, { gql } from "graphql-request";
import { HelpCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { celo } from "wagmi/chains";
import { z } from "zod";

import ENSResolverInput from "@/components/ens-input";
import { SkeletonTipAttestation } from "@/components/skeleton-tip-attestation";
import TipAttestation, {
  TipAttestationProps,
} from "@/components/tip-attestation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import { commonsConfig } from "@/abis/commons";
import { praiseConfig } from "@/abis/praise";

const query = gql`
  query Attestations($schemaId: String!) {
    attestations(where: { schemaId: { equals: $schemaId } }) {
      id
      data
      decodedDataJson
      recipient
      timeCreated
      revoked
      schemaId
      expirationTime
      refUID
      time
      expirationTime
      revocable
      attester
    }
  }
`;
const formSchema = z.object({
  comment: z.string(),
  amount: z
    .string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0")
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num)) throw new Error("Invalid number");
      return num;
    }),
  recipient: z.custom<string>(isAddress, "Invalid Ethereum address"),
});

export default function TipPage() {
  const account = useAccount();

  const { toast } = useToast();

  const {
    data: attestationData,
    isLoading: isAttestationLoading,
    isError: isAttestationError,
  } = useQuery<TipAttestationProps[]>({
    queryKey: ["attestations"],
    queryFn: async () => {
      return await request("https://celo.easscan.org/graphql", query, {
        schemaId:
          "0x593a851ab1a1c24f811b6fc5a4df86a4df7dd14f441c2d99476af3d5ef56341a",
      }).then((res: any) => res.attestations);
    },
    refetchInterval: 1000,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
      amount: 0,
      recipient: "",
    },
  });

  const { data: approvalHash, writeContract: approve } = useWriteContract();
  const { data: tipHash, writeContract: tip } = useWriteContract();

  const allowance = useReadContract({
    address: commonsConfig.address as `0x${string}`,
    abi: commonsConfig.abi,
    functionName: "allowance",
    args: [account.address!, praiseConfig.address as `0x${string}`],
    query: {
      refetchInterval: 1000,
    },
  });

  const allowanceAvailable =
    allowance && allowance.data ? BigInt(allowance.data as bigint) : BigInt(0);

  async function handleSetAllowance(amount: bigint) {
    approve(
      {
        abi: commonsConfig.abi,
        address: commonsConfig.address as `0x${string}`,
        functionName: "approve",
        args: [praiseConfig.address as `0x${string}`, amount],
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
  }

  async function praise(
    comment: string,
    recipient: `0x${string}`,
    amount: bigint
  ) {
    tip(
      {
        abi: praiseConfig.abi,
        address: praiseConfig.address as `0x${string}`,
        functionName: "praiseWithTip",
        args: [comment, account.address as `0x${string}`, recipient, amount],
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Tx submitted successfully.",
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
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { comment, amount, recipient } = data;

    await praise(
      comment,
      recipient as `0x${string}`,
      BigInt(parseUnits(amount.toString(), 18))
    );
  }

  const {
    isLoading: isApproving,
    isSuccess: isApproved,
    isError: IsErrorApproved,
  } = useWaitForTransactionReceipt({
    chainId: celo.id,
    hash: approvalHash,
  });

  const {
    isLoading: isTipping,
    isSuccess: isTipped,
    isError: IsErrorTipped,
  } = useWaitForTransactionReceipt({
    chainId: celo.id,
    hash: tipHash,
  });

  useEffect(() => {
    if (isApproved) {
      toast({
        title: "Tx successfully confirmed",
        description: "Tx confirmed",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://celoscan.io/tx/${approvalHash}`
              );
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
    if (IsErrorApproved) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tx failed",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://celoscan.io/tx/${approvalHash}`
              );
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
  }, [isApproved, IsErrorApproved, approvalHash, toast]);

  useEffect(() => {
    if (isTipped) {
      toast({
        title: "Tx successfully confirmed",
        description: "Tx confirmed",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://celoscan.io/tx/${tipHash}`
              );
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
    if (IsErrorTipped) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Tx failed",
        action: (
          <ToastAction
            altText="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://celoscan.io/tx/${tipHash}`
              );
            }}
          >
            Copy
          </ToastAction>
        ),
      });
    }
  }, [isTipped, IsErrorTipped, tipHash, toast]);

  const dooglyRecipient = form.watch("recipient");

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Tip to commoners with comment</CardTitle>
            <CardDescription>
              tipped amount will be sent to recipient directly. The comment and
              amount will be stored on-chain via EAS.
            </CardDescription>
            <a
              className="text-sm text-gray-600 font-mono break-all"
              href={`https://celo.easscan.org/schema/view/0x593a851ab1a1c24f811b6fc5a4df86a4df7dd14f441c2d99476af3d5ef56341a`}
              target="_blank"
              rel="noreferrer"
            >
              view schema on easscan
            </a>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name={"recipient"}
                  render={({ field }) => (
                    <ENSResolverInput
                      field={field}
                      placeholder="0x... or ENS name"
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Thanks commoner!"
                          className="border border-gray-300 rounded-md p-2"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Leave a comment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <Input
                            id="amount"
                            placeholder="0"
                            className="border border-gray-300 rounded-md p-2 min-w-[120px]"
                            {...field}
                          />
                          <span className="whitespace-nowrap">$COMMONS</span>
                        </div>
                      </FormControl>
                      <FormDescription>Amount to tip</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2 items-center">
                  {parseUnits(form.watch("amount").toString(), 18) >
                    allowanceAvailable && (
                    <Button
                      type="button"
                      className="w-full"
                      disabled={
                        !account.isConnected ||
                        isApproving ||
                        !form.watch("amount")
                      }
                      onClick={() =>
                        handleSetAllowance(
                          BigInt(
                            parseUnits(form.watch("amount").toString(), 18)
                          )
                        )
                      }
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>approving...</span>
                        </>
                      ) : (
                        "Approve $COMMONS for contract"
                      )}
                    </Button>
                  )}
                  <Button
                    disabled={
                      isApproving ||
                      !account.isConnected ||
                      isTipping ||
                      !form.formState.isValid ||
                      parseUnits(form.watch("amount").toString(), 18) >
                        allowanceAvailable
                    }
                    type="submit"
                    className="w-full"
                  >
                    {isTipping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>submitting...</span>
                      </>
                    ) : (
                      "Tip"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            {/* <div className="text-center flex flex-col gap-1">
              <p className="items-center my-2">or</p>

              <DooglyTippingButton
                key={dooglyRecipient}
                buttonText="Tip with Doogly"
                modalTitle="Make a Donation"
                config={{
                  destinationChain: "celo",
                  destinationAddress:
                    "0xFa1aD6310C6540c5430F9ddA657FCE4BdbF1f4df",
                  receiverAddress: dooglyRecipient,
                  destinationOutputTokenAddress:
                    "0x7b97031b6297bc8e030B07Bd84Ce92FEa1B00c3e",
                }}
                buttonClassName="w-full"
                modalStyles={{
                  backgroundColor: "white",
                  headingColor: "black",
                  textColor: "white",
                  buttonColor: "black",
                }}
              />

              <div className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>what is Doogly?</span>
                        <HelpCircle className="h-4 w-4 " />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {`Doogly is a cross-chain donation service that you can 
    send any tokens from any blockchain.`}
                        <br />
                        {`Recipients can receive their preferred tokens 
    on their chosen chain.`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {isAttestationLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonTipAttestation key={index} />
          ))}
        {attestationData?.map((attestation, index) => (
          <TipAttestation key={index} {...attestation} />
        ))}
      </div>
    </div>
  );
}
