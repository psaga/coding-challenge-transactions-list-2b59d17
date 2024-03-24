import { put, takeEvery } from "redux-saga/effects";
import {
  JsonRpcProvider,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
  BrowserProvider,
  Signer,
  parseEther,
} from "ethers";

import apolloClient from "../apollo/client";
import { Actions, TransactionPayload } from "../types";
import { SaveTransaction } from "../queries";
import { PayloadAction } from "@reduxjs/toolkit";

function* sendTransaction(action: PayloadAction<TransactionPayload>) {
  const provider = new JsonRpcProvider("http://localhost:8545");
  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();
  const fromAddress: string = yield signer.getAddress();

  const nonce:number = yield provider.getTransactionCount(fromAddress, 'latest');

  const transaction = {
    nonce,
    to: action.payload.to,
    value: parseEther(action.payload.value),
  };

  try {
    const txResponse: TransactionResponse =
      yield signer.sendTransaction(transaction);
    const response: TransactionReceipt = yield txResponse.wait();

    const receipt: Transaction = yield response.getTransaction();

    const variables = {
      transaction: {
        gasLimit: (receipt.gasLimit && receipt.gasLimit.toString()) || "0",
        gasPrice: (receipt.gasPrice && receipt.gasPrice.toString()) || "0",
        to: receipt.to,
        from: receipt.from,
        value: (receipt.value && receipt.value.toString()) || "",
        data: receipt.data || null,
        chainId: (receipt.chainId && receipt.chainId.toString()) || "123456",
        hash: receipt.hash,
      },
    };

    yield apolloClient.mutate({
      mutation: SaveTransaction,
      variables,
    });
    yield put({ type: Actions.SendTransactionSuccess, data: { txHash: receipt.hash } });
  } catch (error) {
    yield put({ type: Actions.SendTransactionFailure, error: error });
  }
}

export function* rootSaga() {
  yield takeEvery(Actions.SendTransaction, sendTransaction);
}
