"use client";
import React, { useState } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import DonateDrop from "@/components/ui/DonateDrop";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDonate = () => {
    setIsDonateOpen(false);
  };

  const menuItems = [
    { href: "/", label: "Earn" },
    { href: "/manifesto", label: "Manifesto" },
    { href: "/token", label: "Token" },
    { 
      href: "https://app.charmverse.io/commons-protocol/forum", 
      label: "Forum",
      newTab: true,
    },
    {
      href: "https://app.ubeswap.org/#/stakes/0x8585A611521717Ffe7d93cF264DbE936E484DBa0",
      label: "Staking",
      newTab: true,
    },
    { href: "/tip", label: "Tip" },
    // { href: "/donate", label: "Donate" },
    //{href: 'https://guild.xyz/commons', label: 'Guild', newTab: true}
  ];

  return (
    <>
    <nav className="border-gray-200 px-4 lg:px-6 py-5 bg-white">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/commons-logo.jpg"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <ConnectButton />
          <button
            onClick={toggleMenu}
            type="button"
            className="ml-3 inline-flex items-center p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:w-auto">
          <ul className="flex space-x-8">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  target={item.newTab ? "_blank" : ""}
                  className="text-gray-700 hover:text-primary-700 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li
            onClick={()=> setIsDonateOpen(true)}
            className="text-gray-700 hover:cursor-pointer hover:text-primary-700 transition-colors duration-200"
            >
              Donate
            </li>
          </ul>
        </div>

        {/* Desktop ConnectButton */}
        <div className="hidden lg:flex items-center">
          <ConnectButton />
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${isMenuOpen ? "block" : "hidden"} lg:hidden w-full mt-4`}
          id="mobile-menu"
        >
          <ul className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block text-gray-700 hover:text-primary-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li
            onClick={()=> {
              setIsMenuOpen(false)
              setIsDonateOpen(true)
            }}
            className="text-gray-700 hover:cursor-pointer hover:text-primary-700 transition-colors duration-200"
            >
              Donate
            </li>
          </ul>
        </div>
      </div>
    </nav>
    {isDonateOpen &&

    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
      <DonateDrop toggleDonate={toggleDonate}/>
    </div>
    }
    </>
  );
};

export default Header;
