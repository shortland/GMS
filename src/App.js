import "./App.css";

import { UserData, UserDataWrapper } from "./Data/UserData";
import { NftHolders } from "./Components/NftHolders";
import { NftTrades } from "./Components/NftTrades";

const App = () => {
    return (
        <>
            <br />
            <div>
                {UserDataWrapper(UserData(150002))}
                <hr />
                <NftHolders />
                <hr />
                <NftTrades />
            </div>
        </>
    );
};

export default App;
