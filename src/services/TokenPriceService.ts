import { Address } from 'viem';
import { CoingeckoCoin, CoingeckoToken, fetchCoinPricesByGranularity, fetchCoins } from '../utils/CoingeckoApi';
import { CurrencyCode } from '../utils/CurrencyUtils';
import { UnitOfTime } from '../utils/DateUtils';
import { networks } from '../utils/Network';
import { SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP } from '../utils/SuperTokenCoinIds';

export interface NetworkToken {
	chainId: number;
	token: string;
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

	return Promise.all(
		matchedTokens.map((matchedToken) =>
			fetchCoinPricesByGranularity(matchedToken, currency, priceGranularity, startTimestamp, endTimestamp),
		),
	);
};

function matchCoingeckoTokens(networkTokens: NetworkToken[], coingeckoCoins: CoingeckoCoin[]): CoingeckoToken[] {
	return networkTokens.reduce((matchedTokens, networkToken) => {
		// Try to match by platform address first
		const coingeckoCoin = coingeckoCoins.find(
			(token) => token.platforms[networks[networkToken.chainId].coingeckoId] === networkToken.token,
		);

		// If found by platform address, use it
		if (coingeckoCoin) {
			return [...matchedTokens, {
				...networkToken,
				coingeckoId: coingeckoCoin.id,
			} as CoingeckoToken];
		}

		// Check if token exists in SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP
		const superTokenCoingeckoId = SUPERTOKEN_ADDRESS_TO_COINGECKO_ID_MAP[networkToken.chainId][networkToken.token as Address];
		if (superTokenCoingeckoId) {
			return [...matchedTokens, {
				...networkToken,
				coingeckoId: superTokenCoingeckoId,
			} as CoingeckoToken];
		}

		return matchedTokens;
	}, [] as CoingeckoToken[]);
}
