import { useState } from "react";
import React from "react";
import ApexCharts from "apexcharts";

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
          block {
            timestamp
          }
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

/**
 * Gets all the transaction history of a particular NFT.
 * Then filters to get only transactions that were trades (aka sales).
 */
const fetchNftTradeHistoryData = async (nftId) => {
    const history = (
        await client.query(tradesQuery.replace("NFT_ID", nftId)).toPromise()
    )["data"]["nonFungibleToken"]["transactions"];

    return history.filter((trade) => {
        return "__typename" in trade && trade["__typename"] === "TradeNFT";
    });
};

/**
 * Returns a list of timestamps for the past 365 days
 */
const getDayTimestamps = (lookback = 365, set = {}) => {
    if (lookback === -1) {
        return set;
    }

    const today = new Date();
    const priorDate = new Date(new Date().setDate(today.getDate() - lookback));
    priorDate.setHours(0);
    priorDate.setMinutes(0);
    priorDate.setSeconds(0);

    set[priorDate] = {
        date: priorDate,
        trades: [],
    };

    return getDayTimestamps(lookback - 1, set);
};

/**
 * Returns a object, with keys being date objects of the last 365 days.
 * Value of key is object {date: `key, again here`, trades: [`trade object from subgraph`]}
 */
const getDailyTradeHistory = (trades) => {
    const timestamps = getDayTimestamps();

    trades.forEach((trade) => {
        const tradeDate = new Date(
            1000 * parseInt(trade["block"]["timestamp"])
        );

        // candleday is the trade date, but set hour/min/sec to 0
        const candleDay = structuredClone(tradeDate);
        candleDay.setHours(0);
        candleDay.setMinutes(0);
        candleDay.setSeconds(0);

        timestamps[candleDay]["trades"].push(trade);
    });

    return timestamps;
};

/**
 * Convert the messy, but easily accessible object from `getDailyTradeHistory` into a neat, ordered list of objects to feed our chart.
 * e.g. object: {date: `day's date`, ohlc: [12,15,12,15], v: 3}
 */
const getOrderedOhlcVCandles = (trades) => {
    const dustFactor = 1000000000000000000.0;

    const ohlcv = [];

    const dailyTradeHistory = getDailyTradeHistory(trades);
    // TODO: order the objects in the list

    let gotInitialStart = false;

    for (const [key, value] of Object.entries(dailyTradeHistory)) {
        let open = -1;
        let openTime = 0;

        let high = -1;
        let low = -1;

        let close = -1;
        let closeTime = 0;

        // calculating open & close will be a bit different, since we need to compare trade["block"]["timestamp"] with one another
        value["trades"].forEach((trade) => {
            if (trade["realizedNFTPrice"] > high) {
                high = trade["realizedNFTPrice"];
            }
            if (trade["realizedNFTPrice"] < low || low === -1) {
                low = trade["realizedNFTPrice"];
            }

            if (openTime === 0) {
                openTime = trade["block"]["timestamp"];
                open = trade["realizedNFTPrice"];
            }
            if (closeTime === 0) {
                closeTime = trade["block"]["timestamp"];
                close = trade["realizedNFTPrice"];
            }
            if (trade["block"]["timestamp"] < closeTime) {
                closeTime = trade["block"]["timestamp"];
                close = trade["realizedNFTPrice"];
            }
            if (trade["block"]["timestamp"] > openTime) {
                openTime = trade["block"]["timestamp"];
                open = trade["realizedNFTPrice"];
            }
        });

        // ohlcv.push({
        //     date: value["date"],
        //     ohlc: [open, high, low, close],
        //     vol: ,
        // });

        if (!gotInitialStart && value["trades"].length > 0) {
            gotInitialStart = true;
        }

        if (!gotInitialStart) {
            continue;
        }

        // TODO: a better way of removing noise
        // remove bad values
        if (open > dustFactor) {
            open = -1;
        }
        if (high > dustFactor) {
            high = -1;
        }
        if (low > dustFactor) {
            low = -1;
        }
        if (close > dustFactor) {
            close = -1;
        }

        ohlcv.push({
            x: value["date"],
            y: [
                open / dustFactor,
                high / dustFactor,
                low / dustFactor,
                close / dustFactor,
            ],
            // vol: value["trades"].length,
        });
    }

    return ohlcv;
};

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
                        // So, we have a bunch of raw data now, but we want OHLC with a timestamp of the day
                        // let's pass this data to a helper,
                        // first generate timestamp of first second of the day, and then group the raw data blocks into hashmap lists from that.
                        const trades = await fetchNftTradeHistoryData(getNftId);

                        // Get OHLCV of past N days of data
                        const orderedOhlcvCandles =
                            getOrderedOhlcVCandles(trades);
                        console.log(orderedOhlcvCandles);

                        // start hack

                        var options = {
                            chart: {
                                type: "candlestick",
                            },
                            series: [
                                {
                                    data: orderedOhlcvCandles,
                                },
                            ],
                        };

                        const chart = new ApexCharts(
                            document.querySelector("#chart"),
                            options
                        );

                        // hack to get around multiple renders, this isn't React
                        const chartChildren = document.querySelector("#chart");
                        while (chartChildren.firstChild) {
                            chartChildren.removeChild(chartChildren.firstChild);
                        }

                        chart.render();

                        // end hack

                        setNftTradesData(trades);
                    }}
                >
                    Get Trade History
                </button>

                <br />

                {/* {getNftTradesData && getNftTradesData.length > 0 && (
                    <pre>{JSON.stringify(getNftTradesData, null, 4)}</pre>
                )} */}

                {/* {getNftTradesData && getNftTradesData.length > 0 && (
                    <ReactApexChart
                        options={{
                            chart: {
                                type: "bar",
                            },
                            series: [
                                {
                                    name: "sales",
                                    data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
                                },
                            ],
                            xaxis: {
                                categories: [
                                    1991, 1992, 1993, 1994, 1995, 1996, 1997,
                                    1998, 1999,
                                ],
                            },
                        }}
                        // series={this.state.series}
                        type="candlestick"
                        height={350}
                    />
                )} */}
            </div>
        </>
    );
};
