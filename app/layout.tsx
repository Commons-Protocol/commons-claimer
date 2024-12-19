"use client";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {mainnet} from "@wagmi/core/chains";
import { WagmiProvider } from "wagmi";
import { celo } from "wagmi/chains";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

export const config = getDefaultConfig({
  appName: "Commons Protocol",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [celo, mainnet],
  ssr: true,
});
const client = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <title>Commons Protocol</title>
        <meta
          name="description"
          content="build public goods and earn $COMMONS"
        />
        <link rel="icon" href="/favicon.ico" />
        <WagmiProvider config={config} reconnectOnMount={true}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider>
              <Header />
              <Toaster />
              {children}
              <Footer />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
