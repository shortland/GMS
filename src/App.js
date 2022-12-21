import "./App.css";

import { UserData, UserDataWrapper } from "./Data/UserData";
import { NftHoldersData } from "./Data/NftHoldersData";
import { NftHoldersComponent } from "./Components/NftHoldersComponent";

const App = () => {
  return (
    <>
      <br />
      <div>
        {UserDataWrapper(UserData(150002))}
        <hr />
        {NftHoldersComponent()}
      </div>
    </>
  );
};

export default App;
