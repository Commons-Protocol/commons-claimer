import React from "react";

import { Calendar, User } from "lucide-react";
import { formatUnits, fromHex } from "viem";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { formatBlockTimestamp, sliceAddress } from "@/utils";

export interface DecodedData {
  name: string;
  type: string;
  signature: string;
  value: any;
}

export interface TipAttestationProps {
  attester: string;
  data: string;
  decodedDataJson: string;
  expirationTime: number;
  id: string;
  recipient: string;
  refUID: string;
  revocable: boolean;
  revoked: boolean;
  schemaId: string;
  time: number;
  timeCreated: number;
}

export default function TipAttestation({
  attester,
  decodedDataJson,
  id,
  recipient,
  timeCreated,
}: TipAttestationProps) {
  const tipData = JSON.parse(decodedDataJson || "{}");

  return (
    <Card className="mb-4 w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="space-y-1">
              <h3 className="font-medium">{`${tipData[0].value.value}`}</h3>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />

                <span>{`${sliceAddress(
                  tipData[1].value.value
                )} → ${sliceAddress(recipient)}`}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {tipData[3].value.value && (
              <Badge variant="secondary" className="text-sm">
                {`${formatUnits(
                  fromHex(tipData[3].value.value.hex, "bigint"),
                  18
                )}`}
                {" COMMONS"}
              </Badge>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {formatBlockTimestamp(timeCreated.toString())}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
