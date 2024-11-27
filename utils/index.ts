export const TOKEN_ADDRESS = "0x7b97031b6297bc8e030B07Bd84Ce92FEa1B00c3e";
export const SCHEMA_UID =
  "0xa1215b03d4956c2e07792ccc30da1b48742a2c6dde9b12d2c97d5b16cf8263b8";
// on celo https://celo.easscan.org/schema/view/0xa1215b03d4956c2e07792ccc30da1b48742a2c6dde9b12d2c97d5b16cf8263b8

export const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const formatBlockTimestamp = (blockTimestamp: string): string => {
  // Convert string to number and multiply by 1000 to get milliseconds
  const date = new Date(Number(blockTimestamp) * 1000);

  // Get month, day, and year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add 1 because months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  // Return formatted date string
  return `${month}/${day}/${year}`;
};

export const formatTokenAmount = (
  amount: any,
  decimals: number,
  displayDecimals = 2
) => {
  if (!amount) return "0";
  const divisor = BigInt(10 ** decimals);
  const beforeDecimal = BigInt(amount) / divisor;
  const afterDecimal = BigInt(amount) % divisor;
  const afterDecimalStr = afterDecimal.toString().padStart(decimals, "0");
  const result = `${beforeDecimal}.${afterDecimalStr.slice(
    0,
    displayDecimals
  )}`;
  return parseFloat(result).toFixed(displayDecimals);
};

export function sliceAddress(address: string) {
  if (typeof address !== "string") return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}
