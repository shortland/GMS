import "./App.css";

import { UserData, UserDataWrapper } from "./Data/UserData";
import { NftHoldersComponent } from "./Components/NftHoldersComponent";
import { NftTradesComponent } from "./Components/NftTradesComponent";

const App = () => {
    return (
        <>
            <br />
            <div>
                {UserDataWrapper(UserData(150002))}
                <hr />
                {NftHoldersComponent()}
                <hr />
                <NftTradesComponent />
            </div>
        </>
    );
};

export default App;
