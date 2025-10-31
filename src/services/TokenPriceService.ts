import { Address } from 'viem';
import { CoingeckoCoin, CoingeckoToken, fetchCoinPricesByGranularity, fetchCoins } from '../utils/CoingeckoApi';
import { CurrencyCode } from '../utils/CurrencyUtils';
import { UnitOfTime } from '../utils/DateUtils';
import { networks } from '../utils/Network';
import { SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP } from '../utils/SuperTokenCoinIds';

export interface NetworkToken {
	chainId: number;
	token: string;
	underlyingAddress: string | null;
}

export const getTokensPrices = async (
	networkTokens: NetworkToken[],
	currency: CurrencyCode,
	priceGranularity: UnitOfTime,
	startTimestamp: number,
	endTimestamp: number,
) => {
	const tokens = await fetchCoins();
	const matchedTokens = matchCoingeckoTokens(networkTokens, tokens);

	const tokenPrices = await Promise.all(
		matchedTokens.map((matchedToken) =>
			fetchCoinPricesByGranularity(matchedToken, currency, priceGranularity, startTimestamp, endTimestamp),
		),
	);

	return tokenPrices;
};

function matchCoingeckoTokens(networkTokens: NetworkToken[], coingeckoCoins: CoingeckoCoin[]): CoingeckoToken[] {
	return networkTokens.reduce((matchedTokens, networkToken) => {
		
		// Check if token exists in hardcoded list
        const chainTokenMap = SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP[networkToken.chainId];
        const superTokenCoingeckoId = chainTokenMap?.[networkToken.token.toLowerCase() as Address];
		if (superTokenCoingeckoId) {
			return [...matchedTokens, {
				...networkToken,
				coingeckoId: superTokenCoingeckoId,
			} as CoingeckoToken];
		}

		if (networkToken.underlyingAddress) {
			// Try to match by fetched platform address
            const networkMeta = networks[networkToken.chainId];
            const coingeckoCoin = networkMeta
                ? coingeckoCoins.find(
                    (token) => token.platforms[networkMeta.coingeckoId] === networkToken.underlyingAddress,
                )
                : undefined;
	
			// If found by fetched platform address, use it
			if (coingeckoCoin) {
				return [...matchedTokens, {
					...networkToken,
					coingeckoId: coingeckoCoin.id,
				} as CoingeckoToken];
			}
		}

		return matchedTokens;
	}, [] as CoingeckoToken[]);
}
