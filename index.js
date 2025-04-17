import { ethers } from "ethers";
import dotenv from "dotenv";
import { createSmartAccountClient } from "@biconomy/account";
import { BiconomyPaymaster } from "@biconomy/paymaster";

dotenv.config();

const BNB_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
const ENTRY_POINT = "0x9406Cc6185a346906296840746125a0E44976454";

const main = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(BNB_TESTNET_RPC);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const smartAccount = await createSmartAccountClient({
      signer,
      chainId: 97,
      bundlerUrl:
        "https://bundler.biconomy.io/api/v3/97/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      entryPointAddress: ENTRY_POINT,
    });

    const smartAccountAddress = await smartAccount.getAddress();
    console.log("✅ Smart Account Address:", smartAccountAddress);

    const tx = {
      to: "0x34aC1D4FA2CFF01E82E8639115b421b5cbb194E6",
      data: "0x",
      value: ethers.utils.parseEther("0.0001"),
    };

    let userOp;
    try {
      userOp = await smartAccount.buildUserOp([tx]);
    } catch (err) {
      console.error("❌ Error building UserOp:", err);
      return;
    }

    if (process.env.USE_PAYMASTER === "true") {
      const paymaster = new BiconomyPaymaster({
        paymasterUrl: `https://paymaster.biconomy.io/api/v2/97/${process.env.BICONOMY_PAYMASTER_API_KEY}`,
      });

      try {
        const paymasterData = await paymaster.getPaymasterAndData(userOp);
        userOp.paymasterAndData = paymasterData.paymasterAndData;
        console.log("🚀 Using Paymaster (gasless)");
      } catch (err) {
        console.error("❌ Paymaster error:", err);
        return;
      }
    }

    const userOpResponse = await smartAccount.sendUserOp(userOp);
    console.log("📨 UserOp Hash:", userOpResponse.userOpHash);

    const txReceipt = await smartAccount.getUserOpReceipt(userOpResponse.userOpHash);
    console.log("✅ Transaction Mined:", txReceipt?.receipt.transactionHash);
  } catch (err) {
    console.error("❌ Top-level error:", err);
  }
};

main();

