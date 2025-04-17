import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const BNB_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
const ENTRY_POINT = "0x9406Cc6185a346906296840746125a0E44976454";
const SMART_ACCOUNT = "0x11946976446Ce11a8996D6afc390166d311E8eE8";
const BUNDLER_URL = "https://bundler.biconomy.io/api/v2/97/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44";
const PAYMASTER_URL = `https://paymaster.biconomy.io/api/v2/97/${process.env.BICONOMY_PAYMASTER_API_KEY}`;

const provider = new ethers.providers.JsonRpcProvider(BNB_TESTNET_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const dummySignature =
  "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32F37F5beA87BDD5374eB2aC54eA8e000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const partialUserOp = {
    sender: SMART_ACCOUNT,
    nonce: "0x0", // You can fetch real nonce using smart contract if needed
    initCode: "0x",
    callData:
      "0x", // Replace this with ABI-encoded function call data (e.g., ERC20.transfer)
    paymasterAndData: "0x",
    signature: dummySignature,
  };

  // 1. Get Gas Fee Values
  const { data: gasData } = await axios.post(BUNDLER_URL, {
    jsonrpc: "2.0",
    method: "biconomy_getGasFeeValues",
    params: [],
    id: Date.now(),
  });

  const { maxFeePerGas, maxPriorityFeePerGas } = gasData.result;

  const userOp = {
    ...partialUserOp,
    callGasLimit: "500000",
    verificationGasLimit: "500000",
    preVerificationGas: "500000",
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  // 2. Get Sponsored Paymaster Data
  const paymasterReq = {
    jsonrpc: "2.0",
    method: "pm_sponsorUserOperation",
    id: Date.now(),
    params: [
      {
        ...userOp,
        paymasterAndData: "0x",
        callGasLimit: userOp.callGasLimit.toString(),
        verificationGasLimit: userOp.verificationGasLimit.toString(),
        preVerificationGas: userOp.preVerificationGas.toString(),
        maxFeePerGas: userOp.maxFeePerGas.toString(),
        maxPriorityFeePerGas: userOp.maxPriorityFeePerGas.toString(),
      },
      {
        mode: "SPONSORED",
        sponsorshipInfo: {
          webhookData: {},
          smartAccountInfo: {
            name: "BICONOMY",
            version: "2.0.0",
          },
        },
        expiryDuration: 300,
        calculateGasLimits: true,
      },
    ],
  };

  const {
    data: {
      result: {
        paymasterAndData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
      },
    },
  } = await axios.post(PAYMASTER_URL, paymasterReq);

  const finalUserOp = {
    ...userOp,
    paymasterAndData,
    callGasLimit: callGasLimit.toString(),
    verificationGasLimit: verificationGasLimit.toString(),
    preVerificationGas: preVerificationGas.toString(),
  };

  // 3. Sign UserOperation (using hash or contract call — not shown here)
  // TODO: Implement signUserOp(finalUserOp)

  console.log("📦 Final UserOp:", finalUserOp);
}

main().catch(console.error);

