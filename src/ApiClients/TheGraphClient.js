import { createClient } from "urql";

const APIURL = "https://api.thegraph.com/subgraphs/name/loopring/loopring";

const client = createClient({
  url: APIURL,
});

export default client;
