"use client";

import React, { useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";


export default function DonateDrop({toggleDonate}: any){

    const [amount, setAmount] = useState('')

    return (
        // <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 p-4">
            <div className="relative w-[300px] h-fit gap-8 flex flex-col items-center justify-center p-8 rounded-lg border bg-white text-gray-700">
                <button
                onClick={toggleDonate}
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900">

                    <X size={24} />
                    
                </button>
                <p className='mt-10 text-center'>All donations goes directly to the builders in commons</p>
                <div className='flex flex-row gap-4 items-center justify-between'>
                    <button onClick={() => setAmount('10')} className='py-1 px-2 outline-none rounded-sm text-black border border-blue-600 hover:bg-blue-600 hover:text-white'>
                        $10
                    </button>

                    <button onClick={() => setAmount('25')} className='py-1 px-2 rounded-sm text-black border border-blue-600 hover:bg-blue-600 hover:text-white'>
                        $25
                    </button>

                    <button onClick={() => setAmount('50')} className='py-1 px-2 rounded-sm text-black border border-blue-600 hover:bg-blue-600 hover:text-white'>
                        $50
                    </button>
                    
                </div>
                <input 
                type="number" 
                placeholder="Enter an amount to Donate" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="py-1 pl-1 border-none outline-none rounded-sm bg-gray-100 items-center placeholder:text-xs placeholder:text-gray-500"/>
                
                <button className='py-2 px-4 outline-none rounded-md text-white font-bold bg-blue-600 hover:bg-opacity-75'>
                        DONATE
                </button>
                
                {/* <Button variant={'default'}>
                    DONATE
                </Button> */}
            </div>
    )

}