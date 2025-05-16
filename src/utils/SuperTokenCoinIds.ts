import { Address } from "viem";

export const SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP: Record<number, Record<Address, string>> = ensureLowercaseAddresses({
    1: {
        "0x1ba8603da702602a8657980e825a6daa03dee93a": "usd-coin",
        "0x3fa59ea0eee311782c5a5062da1fabd1a70e1d6d": "revv",
        "0x4400739e153af87fb50a9734300725651d96e076": "wrapped-oeth",
        "0x479347dfd0be56f2a5f7bb1506bfd7ab24d4ba26": "unification",
        "0x4f228bf911ed67730e4b51b1f82ac291b49053ee": "dai",
        "0x7367ab6df2af082f04298196167f37f1e1629d1e": "usds",
        "0xc22bea0be9872d8b7b3933cec70ece4d53a900da": "ethereum",
        "0xccae82e3fef132ed091a4d5f48d3f3e1b31a8790": "wrapped-ousd",
        "0xd70408b34ed121722631d647d37c4e6641ec363d": "aragon"
    },
    10: {
        "0x1828bff08bd244f7990eddcd9b19cc654b33cdb4": "optimism",
        "0x35adeb0638eb192755b6e52544650603fe65a006": "usd-coin",
        "0x4ac8bd1bdae47beef2d1c6aa62229509b962aa0d": "ethereum",
        "0x4cab5b9930210e2edc6a905b9c75d615872a1a7e": "giveth",
        "0x7d342726b69c28d942ad8bfe6ac81b972349d524": "makerdao-optimism-bridged-dai-optimism",
        "0x8430f084b939208e2eded1584889c9a66b90562f": "bridged-usd-coin-optimism",
        "0x9638ec1d29dfa9835fdb7fa74b5b77b14d6ac77e": "optimism-bridged-wbtc-optimism",
        "0x9f41d0aa24e599fd8d0c180ee3c0f609dc41c622": "glo-dollar"
    },
    56: {
        "0x0419e1fa3671754f77ec7d5416219a5f9a08b530": "binance-bridged-usdc-bnb-smart-chain",
        "0x529a4116f160c833c61311569d6b33dff41fd657": "binancecoin"
    },
    100: {
        "0x1234756ccf0660e866305289267211823ae86eec": "gnosis-xdai-bridged-usdc-gnosis",
        "0x59988e47a3503aafaa0368b9def095c818fdca01": "xdai",
        "0x63e62989d9eb2d37dfdb1f93a22f063635b07d51": "minerva-wallet",
        "0x7aeca73f38f8f33ab7ff067fed1268384d12324d": "bright-token",
        "0x9757d68a4273635c69d93b84ee3cdac2304dd467": "gnosis-xdai-bridged-weth-gnosis-chain",
        "0xac945dc430cef2bb8fb78b3cb5fbc936dd2c8ab6": "cow-protocol",
        "0xc0712524b39323eb2437e69226b261d928629dc8": "honey",
        "0xd30aa2f6fc32c4dc8bf3bd5994d89c8f9e81fcd1": "savings-xdai",
        "0xe83fd17028c2dd3ca4a9b75f2836d4558fe00686": "daohaus"
    },
    137: {
        "0x00fa3405a6bbd94549f3b4855a9736766c4f237e": "polygon-bridged-usdt-polygon",
        "0x02ef6868d69707b6093a2962bb5fe5661fcc0deb": "stasis-eurs",
        "0x07b24bbd834c1c546ece89ff95f71d9f13a2ebd1": "usd-coin",
        "0x12c294107772b10815307c05989dabd71c21670e": "stake-dao",
        "0x1305f6b6df9dc47159d12eb7ac2804d4a33173c2": "polygon-pos-bridged-dai-polygon-pos",
        "0x1adca32b906883e474aebcba5708b41f3645f941": "museum-of-crypto-art",
        "0x229c5d13452dc302499b5c113768a0db0c9d5c05": "blackpool-token",
        "0x27e1e4e6bc79d93032abef01025811b7e4727e85": "polygon-pos-bridged-weth-polygon-pos",
        "0x2c530af1f088b836fa0dca23c7ea50e669508c4c": "maker",
        "0x3038b359240dff5ccd42dffd21f12b428034be38": "ageur",
        "0x32cefdf2b3df73bdebaa7cd3b0135b3a79d28dcc": "request-network",
        "0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3": "matic-network",
        "0x3d9cc088bd9357e5941b68d26d6d09254a69949d": "meta",
        "0x4086ebf75233e8492f1bcda41c7f2a8288c2fb92": "polygon-bridged-wbtc-polygon-pos",
        "0x48a7908771c752aacf5cd0088dad0a0daaea3716": "bonsai-token",
        "0x49765f8fcf0a1cd4f98da906f0974a9085d43e51": "xsgd",
        "0x4bde23854e7c81218463f6c8f331b46144e98eac": "jarvis-synthetic-euro",
        "0x5d6fdc854b46e8b237bd2ccc2714cfa3d18cf58e": "alongside-crypto-market-index",
        "0x5e31d5bdd6c87edff8659d9ead9ce0013fb47184": "euroe-stablecoin",
        "0x61a7b6f0a7737d9bd38fdeaf1d4160e16bf23043": "the-employment-commons-work-token",
        "0x72a9bae5ce6de9816aadcbc24daa09f5d169a980": "monerium-eur-money",
        "0x7f078f02a77e91e67ee592faed23d1cfcb390a60": "crosschain-iotx",
        "0x96eac3913bab431c28895f02cf5c56ad2dab8439": "curve-dao-token",
        "0x992446b88a7e62c7235bd88108f44543c1887c1f": "mimatic",
        "0xa1bd23b582c12c22e5e264a0a69847ca0ed9f2b0": "chainlink",
        "0xb0512060ee623a656da1f25686743474228ba0e6": "apwine",
        "0xb63e38d21b31719e6df314d3d2c351df0d4a9162": "idle",
        "0xb683fb34a77c06931ba62d804252d1f60596a36a": "sporkdao",
        "0xcaa7349cea390f89641fe306d93591f87595dc1f": "bridged-usdc-polygon-pos-bridge",
        "0xcb5676568febb4e4f0dca9407318836e7a973183": "instadapp",
        "0xd89c35b586eadfbde1a3b2d36fb5746c6d3601bc": "metavault-trade",
        "0xe04ad5d86c40d53a12357e1ba2a9484f60db0da5": "wmatic",
        "0xe0d1978033ee7cf12a8246da7f173f9441b769b0": "revv",
        "0xe2d04ab74eed9627c828b3fc10e5fc96fae70348": "jarvis-synthetic-swiss-franc",
        "0xfac83774854237b6e31c4b051b91015e403956d3": "ix-token",
        "0xfbb291570de4b87353b1e0f586df97a1ed856470": "jpyc",
        "0xfd0577c4707367ff9b637f219388919d3be37592": "gains-network"
    },
    8453: {
        "0x04ffb9ce95af003a3aa3611be6c6ca1431151fb5": "le-bleu-elefant",
        "0x09b1ad979d093377e201d804fa9ac0a9a07cfb0b": "aerodrome-finance",
        "0x1783b0f81e2f2278155a643370e6b3ace789f2c9": "island-token",
        "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529": "degen-base",
        "0x28a4b2bb3ceb599a13c5b294b26c1c49b1252860": "wrapped-super-oeth",
        "0x304989da2adc80a6568170567d477af5e48dbaae": "ether-fi-bridged-weeth-base",
        "0x46fd5cfb4c12d87acd3a13e92baa53240c661d93": "ethereum",
        "0x4db26c973fae52f43bd96a8776c2bf1b0dc29556": "bridged-usd-coin-base",
        "0x4e395ec7b71dd87a23dd836edb3efe15a6c2002b": "nounspace",
        "0x58122a048878f25c8c5d4b562419500ed74c6f75": "superbridge-bridged-wsteth-base",
        "0x5f2fab273f1f64b6bc6ab8f35314cd21501f35c5": "higher",
        "0x65e9b4ae7885bd3e4e1cc4f280863b859d231fc2": "treeplanting",
        "0x708169c8c87563ce904e0a7f3bfc1f3b0b767f41": "l2-standard-bridged-dai-base",
        "0x7d2e87324c9b2cc983804fe53df67f1add3f913c": "susds",
        "0x7ef392131c3ab326016cf7b560f96c91f4f9d4fa": "moxie",
        "0x8414ab8c70c7b16a46012d49b8111959baf2fc42": "build-2",
        "0x9097e4a4d75a611b65ab21d98a7d5b1177c050f7": "mfercoin",
        "0xa3666ccb1c004060bccc4df7c97c7e6c4979bbe4": "astro-fuel",
        "0xc0fbc4967259786c743361a5885ef49380473dcf": "aleph",
        "0xcc6bce523c20f582daaf0ccafaae981df46ceb41": "onchain",
        "0xd04383398dd2426297da660f9cca3d439af9ce1b": "usd-coin",
        "0xdfd428908909cb5e24f5e79e6ad6bde10bdf2327": "coinbase-wrapped-btc",
        "0xe58267cd7299c29a1b77f4e66cd12dd24a2cd2fd": "ionic-protocol",
        "0xefbe11336b0008dce3797c515e6457cc4841645c": "tn100x"
    },
    42161: {
        "0x1dbc1809486460dcd189b8a15990bca3272ee04e": "usd-coin-ethereum-bridged",
        "0x22389dd0df30487a8feaa4eebf98cc64d3273294": "livepeer",
        "0x521677a61d101a80ce0fb903b13cb485232774ee": "makerdao-arbitrum-bridged-dai-arbitrum-one",
        "0x95f1ee4cb6dc16136a79d367a010add361e5192c": "euroe-stablecoin",
        "0xb3edb2f90fec1bf1f872a9ef143cfd614773ad04": "arbitrum",
        "0xd49363d23b774fa9602e46a69c19edd8c4ff88b9": "wrapped-oeth",
        "0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3": "ethereum",
        "0xefa54be8d63fd0d95edd7965d0bd7477c33995a8": "rocket-pool",
        "0xfc55f2854e74b4f42d01a6d3daac4c52d9dfdcff": "usd-coin"
    },
    42220: {
        "0x3acb9a08697b6db4cd977e8ab42b6f24722e6d6e": "celo-dollar",
        "0x51cacc88227a038cb6083a7870daf7fa3ebd906c": "wormhole-bridged-weth-celo",
        "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a": "gooddollar",
        "0x671425ae1f272bc6f79bec3ed5c4b00e9c628240": "celo",
        "0x7a5f9c3e43aadc62647ab5d41802db33dc7d8c4b": "celo-real-creal",
        "0xd9f9a02e49225c7ab5b40fce8d44d256b0e984fb": "celo-euro"
    },
    43114: {
        "0x288398f314d472b82c44855f3f6ff20b633c2a97": "usd-coin",
        "0x6af916e2001bc4935e6d2f256363ed54eb8e20e0": "euroe-stablecoin",
        "0x7cd00c2b9a78f270b897457ab070274e4a17de83": "avalanche-bridged-dai-avalanche",
        "0xa60c5bebccdb9738f63891bbdd7fec3e762f9098": "joe",
        "0xbe916845d8678b5d2f7ad79525a62d7c08abba7e": "avalanche-2",
        "0xc0fbc4967259786c743361a5885ef49380473dcf": "aleph",
        "0xdf37ee57b2efd215a6a8329d6b8b72064f09bbd0": "tether"
    },
    534352: {
        "0x483c1716b6133cda01237ebbf19c5a92898204b7": "weth"
    },
    666666666: {
        "0xda58fa9bfc3d3960df33ddd8d4d762cf8fa6f7ad": "degen-base"
    }
})

export const SUPERTOKEN_ADDRESSES_WITH_COINGECKO_ID = Object.values(SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP)
    .flatMap(addressMap => Object.keys(addressMap));

function ensureLowercaseAddresses<T>(
    chainMap: Record<number, Record<Address, T>>
): Record<number, Record<Address, T>> {
    const result: Record<number, Record<Address, T>> = {};

    for (const [chainId, addressMap] of Object.entries(chainMap)) {
        result[Number(chainId)] = {};
        for (const [address, value] of Object.entries(addressMap)) {
            result[Number(chainId)][address.toLowerCase() as Address] = value;
        }
    }

    return result;
}