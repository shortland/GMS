import { useState } from "react";

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

const fetchHoldersData = async (nftId) => {
    return (
        await client.query(holdersQuery.replace("NFT_ID", nftId)).toPromise()
    )["data"]["nonFungibleToken"]["slots"];
};

// const GetData = (nftId) => {
//   const [holdersData, setHoldersData] = useState([]);

//   useEffect(() => {
//     fetchHoldersData(nftId).then((data) => setHoldersData(data));
//   }, [nftId]);

//   return holdersData;
// };

export const NftHolders = (nftId) => {
    const [getNftId, setNftId] = useState("");
    const [getNftHoldersData, setNftHoldersData] = useState("");

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
                        const d = await fetchHoldersData(getNftId);
                        console.log(d);
                        setNftHoldersData(d);
                    }}
                >
                    Get Holders
                </button>

                <br />

                {getNftHoldersData && getNftHoldersData.length > 0 && (
                    <pre>{JSON.stringify(getNftHoldersData, null, 4)}</pre>
                )}
            </div>
        </>
    );
};
