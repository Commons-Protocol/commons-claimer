import React, { useState } from "react";

import { Loader2 } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { ENSResolver } from "@/lib/ens";

interface ENSResolverInputProps {
  field: any;
  placeholder?: string;
  className?: string;
}

const ENSResolverInput = ({
  field,
  placeholder = "0x...",
  className,
}: ENSResolverInputProps) => {
  const [isResolving, setIsResolving] = useState(false);
  const resolver = new ENSResolver();

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    field.onChange(value);

    if (value.endsWith(".eth")) {
      setIsResolving(true);
      try {
        const address = await resolver.resolveName(value);
        if (address) {
          field.onChange(address);
        }
      } catch (error) {
        console.error("Error resolving ENS:", error);
      } finally {
        setIsResolving(false);
      }
    }
  };

  return (
    <FormItem className="flex-1">
      <FormControl>
        <div className="relative">
          <Input
            {...field}
            value={field.value || ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={className}
          />
          {isResolving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </FormControl>
      <FormDescription>
        {`Enter an ENS name (e.g. "commonsprotocol.eth") or an valid Ethereum address`}
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export default ENSResolverInput;
