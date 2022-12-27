import { useState } from "react";
import { useEffect } from "react";
import client from "../ApiClients/TheGraphClient";

const userDataQuery = `
    query {
        account (
            id: ACCOUNT_ID
        ) {
            internalID
            address
            balances {
                id
                balance
                token {
                    name
                }
            }
            slots {
                id
                balance
                nft {
                    id
                    token
                    nftID
                }
            }
        }
    }
`;

const fetchUserData = async (accountId) => {
    return client
        .query(userDataQuery.replace("ACCOUNT_ID", accountId))
        .toPromise();
};

export const UserDataWrapper = (userData) => {
    const [isVis, setIsVis] = useState(false);

    const toggleVis = (event) => {
        setIsVis((current) => !current);
    };

    return (
        <>
            <div>
                <button onClick={toggleVis}>Toggle User Data</button>

                {isVis && "data" in userData && (
                    <pre>{JSON.stringify(userData.data, null, 4)}</pre>
                )}
            </div>
        </>
    );
};

export const UserData = (accountId) => {
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        fetchUserData(accountId).then((userData) => setUserData(userData));
    }, [accountId]);

    return userData;
};

// export default UserData;
