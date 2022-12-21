import { useState } from "react";
import { useEffect } from "react";
// import { hol } from "../Data/NftHoldersData";
import client from "../ApiClients/TheGraphClient";

export const holdersQuery = `
    query {
        nonFungibleToken(
            id: "NFT_ID"
        ) {
        slots(
            skip: 0
            first: 1000
            orderBy: balance
            orderDirection: desc
        ) {
            id
            account {
                id
                address
            }
            balance
        }
    }
}
`;

async function fetchHoldersData(nftId) {
  return client.query(holdersQuery.replace("NFT_ID", nftId)).toPromise();
}

const GetData = (nftId) => {
  const [holdersData, setHoldersData] = useState([]);

  useEffect(() => {
    fetchHoldersData(nftId).then((data) => setHoldersData(data));
  }, [nftId]);

  return holdersData;
};

export const NftHoldersComponent = (nftId) => {
  const [getNftId, setNftId] = useState("");

  function test() {
    return "hi";
  }

  return (
    <>
      <div>
        <input type="text" onChange={setNftId} placeholder="nft id"></input>
        <button type="button" onClick={() => console.log(test())}>
          Get Data
        </button>

        <br />

        {/* {getNftHoldersData && "data" in getNftHoldersData && (
          <pre>{JSON.stringify(getNftHoldersData.data, null, 4)}</pre>
        )} */}
      </div>
    </>
  );
};
