import "dotenv/config";
import { JsonRpcProvider, Wallet, formatEther } from "ethers";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";

async function main() {
  const { PRIVATE_KEY, RPC_URL, BICONOMY_API_KEY } = process.env;

  if (!PRIVATE_KEY || !RPC_URL || !BICONOMY_API_KEY) {
    throw new Error("❌ Missing environment variables in .env");
  }

  // Ethers v6: Provider & Wallet
  const provider = new JsonRpcProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);

  // Get balance of the wallet
  const balance = await provider.getBalance(wallet.address);
  console.log(`\n👛 EOA Address: ${wallet.address}`);
  console.log(`💰 Balance: ${formatEther(balance)} BNB`);

  // Ensure Biconomy API Key is set and provider is correct
  if (!BICONOMY_API_KEY) {
    throw new Error("❌ Biconomy API key is required.");
  }

  try {
    // Check if wallet and signer are set up correctly
    console.log("Signer address:", wallet.address);

    // Initialize Biconomy Smart Account with necessary configurations
    const smartAccount = new BiconomySmartAccountV2({
      signer: wallet,
      chainId: 97, // BNB Testnet
      bundlerUrl: `https://bundler.biconomy.io/api/v2/97/${BICONOMY_API_KEY}`,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });

    // Attempt to get the counterfactual address
    const saAddress = await smartAccount.getAccountAddress();
    console.log(`\n📦 Smart Account Address: ${saAddress}`);
  } catch (error) {
    console.error("❌ Error during Smart Account setup:", error.message);
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});

