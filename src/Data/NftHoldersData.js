import { useState } from "react";
import { useEffect } from "react";
import client from "../ApiClients/TheGraphClient";

// TODO: skip & first until done
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



// export const NftHoldersDataWrapper = (holdersData) => {
//   const [isVis, setIsVis] = useState(false);

//   const toggleVis = (event) => {
//     setIsVis((current) => !current);
//   };

//   return (
//     <>
//       <div>
//         <buttont  onClick={toggleVis}>Toggle Holders Data</button>

//         {isVis && "data" in holdersData && (
//           <pre>{JSON.stringify(holdersData.data, null, 4)}</pre>
//         )}
//       </div>
//     </>
//   );
// };

export const NftHoldersData = (nftId) => {
  const [holdersData, setHoldersData] = useState([]);

  useEffect(() => {
    fetchHoldersData(nftId).then((data) => setHoldersData(data));
  }, [nftId]);

  return holdersData;
};
