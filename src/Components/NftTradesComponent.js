import { useState } from "react";
import React, { Component } from "react";

import client from "../ApiClients/TheGraphClient";

export const tradesQuery = `
  query {
    nonFungibleToken(
        id: "NFT_ID"
    ) {
      transactions(
        skip: 0
        first: 1000
        orderBy: internalID
        orderDirection: desc
      ) {
        id
        __typename
        block {
          id
          timestamp
        }

        ... on TradeNFT {
          id
          accountSeller {
            id
            address
            __typename
          }
          accountBuyer {
            id
            address
            __typename
          }
          token {
            id
            name
            symbol
            decimals
            address
          }
          nfts {
            id
            minter {
              id
              address
              __typename
            }
            __typename
            nftID
            nftType
            token
          }
          realizedNFTPrice
          feeBuyer
          feeSeller
          fillSA
          fillBA
          fillSB
          fillBB
          tokenIDAS
          protocolFeeBuyer
          __typename
        }
      }
    }
  }
`;

async function fetchNftTradeHistoryData(nftId) {
  return (await client.query(tradesQuery.replace("NFT_ID", nftId)).toPromise())[
    "data"
  ]["nonFungibleToken"]["transactions"];
}

export const NftTradesComponent = () => {
  const [getNftId, setNftId] = useState("");
  const [getNftTradesData, setNftTradesData] = useState("");

  return (
    <>
      <div>
        <input
          type="text"
          onChange={(event) => setNftId(event.target.value)}
          placeholder="id"
          // 0xdcf8ff6b4de163873066118a8eeec9e68c93e284-0-0x0c589fcd20f99a4a1fe031f50079cfc630015184-0x8a1967f5f93da038ad570a5244879031d010b8efa5c95eadcdf7df0f8cfbd25c-10
        ></input>
        <button
          type="button"
          onClick={async () => {
            const d = await fetchNftTradeHistoryData(getNftId);
            console.log(d);
            setNftTradesData(d);
          }}
        >
          Get Trade History
        </button>

        <br />

        {getNftTradesData && getNftTradesData.length > 0 && (
          <pre>{JSON.stringify(getNftTradesData, null, 4)}</pre>
        )}
      </div>
    </>
  );
};
