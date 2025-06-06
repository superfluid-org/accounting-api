import { fromUnixTime, getUnixTime, startOfMonth } from 'date-fns';
import Decimal from 'decimal.js';
import flatten from 'lodash/fp/flatten';
import { TimespanPrice } from '../utils/CoingeckoApi';
import { CurrencyCode } from '../utils/CurrencyUtils';
import { getEndOfPeriodTimestamp, UnitOfTime } from '../utils/DateUtils';
import { Network } from '../utils/Network';
import { queryStreamPeriods as queryStreamPeriodsAndTransfers } from '../utils/SubgraphApi';
import { Address, StreamPeriod, StreamPeriodResult, TransferEventResultWithToken, VirtualStreamPeriod } from '../utils/Types';
import { getTokensPrices, NetworkToken } from './TokenPriceService';
import maxBy from 'lodash/fp/maxBy';
import { minBy, uniqBy } from 'lodash';
import { formatEther, zeroAddress } from 'viem';

export async function getVirtualizedStreamPeriods(
	addresses: Address[],
	networks: Network[],
	startTimestamp: number = getUnixTime(startOfMonth(Date.now())),
	endTimestamp: number = getUnixTime(Date.now()),
	period: UnitOfTime,
	counterpartyAddresses: Address[],
	currency: CurrencyCode,
	priceGranularity: UnitOfTime,
): Promise<StreamPeriod[]> {
	// Fetch all stream periods
	const networksStreamPeriodsAndTransfers = await Promise.all(
		networks.map((network) =>
			queryStreamPeriodsAndTransfers(addresses, network, startTimestamp, endTimestamp, counterpartyAddresses),
		),
	);

	const streamPeriods = flatten(networksStreamPeriodsAndTransfers.map(({ streamPeriods }) => streamPeriods));
	const transfers = flatten(networksStreamPeriodsAndTransfers.map(({ transfers }) => transfers));

	const uniqueTokens = getUniqueNetworkTokenAddresses({ streamPeriods, transfers });
	const tokensWithPriceData = await getTokensPrices(
		uniqueTokens,
		currency,
		priceGranularity,
		startTimestamp,
		endTimestamp,
	);

	const transfersAsStreamPeriods: StreamPeriodResult[] = transfers.map((transfer) => ({
		__typename: "TransferEvent",
		id: transfer.id,
		token: transfer.token,
		flowRate: transfer.value,
		chainId: transfer.chainId,
		sender: transfer.from,
		receiver: transfer.to,
		startedAtTimestamp: transfer.timestamp,
		startedAtBlockNumber: transfer.blockNumber,
		startedAtEvent: {
			transactionHash: transfer.transactionHash,
		},
		stoppedAtTimestamp: transfer.timestamp,
		stoppedAtBlockNumber: transfer.blockNumber,
		stoppedAtEvent: {
			transactionHash: transfer.transactionHash,
		},
		totalAmountStreamed: transfer.value
	}));

	// Map stream periods into virtualized periods based on conf
	const virtualizedStreamPeriods = streamPeriods.map((streamPeriod) => {
		const tokenPriceData = tokensWithPriceData.find(
			(tokenWithPriceData) =>
				tokenWithPriceData.chainId === streamPeriod.chainId &&
				(
					tokenWithPriceData.token.toLowerCase() === streamPeriod.token.id.toLowerCase()
				)
		);
		
		const virtualPeriods = virtualizeStreamPeriod(
			addresses,
			streamPeriod,
			fromUnixTime(startTimestamp),
			fromUnixTime(endTimestamp),
			period,
			tokenPriceData?.prices || [],
		)

		return mapStreamPeriodResult(streamPeriod, virtualPeriods);
	});

	const virtualizedTransfers = transfersAsStreamPeriods.map((transfer) => {
		const tokenPriceData = tokensWithPriceData.find(
			(tokenWithPriceData) =>
				tokenWithPriceData.chainId === transfer.chainId &&
				(
					tokenWithPriceData.token.toLowerCase() === transfer.token.id.toLowerCase()
				)
		);
		
		const virtualPeriods = virtulizeTransfer(
			addresses,
			transfer,
			tokenPriceData?.prices || [],
		)

		return mapStreamPeriodResult(transfer, virtualPeriods);
	});

	const { processedStreamPeriods, unmergedTransfers } = _mergeTransfersIntoStreamPeriods(
		virtualizedStreamPeriods,
		virtualizedTransfers,
	);

	return [...processedStreamPeriods, ...unmergedTransfers]
		.sort((a) => a.startedAtTimestamp);
}

function mapStreamPeriodResult(streamPeriod: StreamPeriodResult, virtualPeriods: VirtualStreamPeriod[]) {
	const {
		sender,
		receiver,
		startedAtEvent,
		stoppedAtEvent,
		__typename,
		token: { __typename: _tokenType, ...tokenRest },
		...rest
	} = streamPeriod;

	return {
		...rest,
		token: tokenRest,
		sender: sender.id,
		receiver: receiver.id,
		startedAtEvent: startedAtEvent.transactionHash,
		stoppedAtEvent: stoppedAtEvent?.transactionHash,
		virtualPeriods,
		totalAmountStreamed: streamPeriod.totalAmountStreamed ?? "0"
	};
}

/**
 * Recursive function to virtualize stream period in different time spans. (Daily, Weekly, Monthly etc.)
 * Amounts are calculated based on the overlapping period of date filter, stream period and virtualized period.
 */
function virtualizeStreamPeriod(
	addresses: Address[],
	streamPeriod: StreamPeriodResult,
	startDate: Date,
	endDate: Date,
	period: UnitOfTime,
	priceData: TimespanPrice[],
): Array<VirtualStreamPeriod> {
	const { flowRate, startedAtTimestamp, stoppedAtTimestamp } = streamPeriod;

	const streamStoppedTimestamp = stoppedAtTimestamp || getUnixTime(Date.now());
	const endTimestamp = Math.min(getUnixTime(endDate), streamStoppedTimestamp);

	// Date when stream period and virtual period start overlapping
	const streamPeriodStartTimestamp = Math.max(getUnixTime(startDate), startedAtTimestamp);

	// Virtual period start and end timestamps (start and end timestamps of day, week, month or year)
	const virtualPeriodEndTimestamp = getEndOfPeriodTimestamp(streamPeriodStartTimestamp, period);

	// Timestamp when stream period, virtual period end and end date filter stop overlapping
	const streamPeriodEndTimestamp = Math.min(virtualPeriodEndTimestamp, endTimestamp);

	const isOutgoing = addresses.includes(streamPeriod.sender.id.toLowerCase());
	const amount = getAmountInTimespan(streamPeriodStartTimestamp, streamPeriodEndTimestamp, flowRate);
	const amountFiat = calculateVirtualStreamPeriodPrice(
		streamPeriodStartTimestamp,
		streamPeriodEndTimestamp,
		flowRate,
		priceData,
	);

	const virtualStreamPeriod: VirtualStreamPeriod = {
		startTime: streamPeriodStartTimestamp,
		endTime: streamPeriodEndTimestamp,
		amount: setDecimalSign(amount, isOutgoing).toFixed(),
		amountFiat: setDecimalSign(amountFiat, isOutgoing).toFixed(18),
	};

	if (endTimestamp <= virtualPeriodEndTimestamp) return [virtualStreamPeriod];

	const nextPeriodStartDate = fromUnixTime(virtualPeriodEndTimestamp + 1);

	return [
		virtualStreamPeriod,
		...virtualizeStreamPeriod(addresses, streamPeriod, nextPeriodStartDate, endDate, period, priceData),
	];
}

function virtulizeTransfer(
	addresses: Address[],
	transfer: StreamPeriodResult,
	priceData: TimespanPrice[],
): Array<VirtualStreamPeriod> {
	const { totalAmountStreamed, startedAtTimestamp, stoppedAtTimestamp = startedAtTimestamp } = transfer;

	const isOutgoing = addresses.includes(transfer.sender.id.toLowerCase());
	const timespanPrice = getPeriodRelevantPriceData(startedAtTimestamp, stoppedAtTimestamp, priceData)[0];
	
	const amount = new Decimal(totalAmountStreamed);
	const amountEther = new Decimal(formatEther(BigInt(amount.toFixed())));
	const amountFiat = timespanPrice ? amountEther.mul(new Decimal(timespanPrice.price.toString())) : new Decimal(0);

	const virtualStreamPeriod: VirtualStreamPeriod = {
		startTime: startedAtTimestamp,
		endTime: stoppedAtTimestamp,
		amount: setDecimalSign(amount, isOutgoing).toFixed(),
		amountFiat: setDecimalSign(amountFiat, isOutgoing).toFixed(18),
	};

	return [virtualStreamPeriod]
}

function setDecimalSign(decimal: Decimal, negative: boolean) {
	if ((negative && Decimal.sign(decimal) < 0) || (!negative && Decimal.sign(decimal) > 0)) return decimal;
	return decimal.mul(-1);
}

function getAmountInTimespan(startTimestamp: number, endTimestamp: number, flowRate: string): Decimal {
	return new Decimal(flowRate).mul(new Decimal(endTimestamp - startTimestamp));
}

function getUniqueNetworkTokenAddresses({ streamPeriods, transfers }: { streamPeriods: StreamPeriodResult[], transfers: TransferEventResultWithToken[] }): NetworkToken[] {
	const allTokens = uniqBy([
		...streamPeriods.map((streamPeriod) => ({ ...streamPeriod.token, chainId: streamPeriod.chainId })),
		...transfers.map((transfer) => ({ ...transfer.token, chainId: transfer.chainId }))
	], x => `${x.chainId}-${x.id}`);

	return Object.values(
		allTokens.reduce((tokens, token) => {
			const {
				chainId,
				id,
				underlyingAddress,
			} = token;

			if (!underlyingAddress || underlyingAddress === zeroAddress) {
				return {
					...tokens,
					[`${chainId}-${id}`]: { chainId, token: id, underlyingAddress: null },
				};
			}
			
			return {
				...tokens,
				[`${chainId}-${id}`]: { chainId, token: id, underlyingAddress },
			};
		}, {}),
	);
}

function getPeriodRelevantPriceData(startTimestamp: number, endTimestamp: number, priceData: TimespanPrice[]) {
	const priceWhenPeriodStarts = maxBy(
		(timespanPrice: TimespanPrice) => timespanPrice.start,
		priceData.filter((timespanPrice) => timespanPrice.start <= startTimestamp),
	);

	const priceDataDuringTimePeriod = priceData.filter(
		(timespanPrice) => timespanPrice.start > startTimestamp && timespanPrice.start <= endTimestamp,
	);

	if (!priceWhenPeriodStarts && priceDataDuringTimePeriod.length === 0) {
		// Fallback to closest price
		const closestPrice = minBy(priceData, (timespanPrice) => Math.abs(timespanPrice.start - startTimestamp));
		return closestPrice ? [closestPrice] : [];
	}

	return priceWhenPeriodStarts ? [priceWhenPeriodStarts, ...priceDataDuringTimePeriod] : priceDataDuringTimePeriod;
}

function calculateVirtualStreamPeriodPrice(
	startTimestamp: number,
	endTimestamp: number,
	flowRate: string,
	priceData: TimespanPrice[],
) {
	const relevantPriceData = getPeriodRelevantPriceData(startTimestamp, endTimestamp, priceData);

	return mapPriceDataToVirtualStreamPeriodRecursive(
		new Decimal(0),
		new Decimal(flowRate),
		startTimestamp,
		endTimestamp,
		relevantPriceData,
	);
}

function mapPriceDataToVirtualStreamPeriodRecursive(
	currentTotal: Decimal,
	flowRate: Decimal,
	startTimestamp: number,
	endTimestamp: number,
	priceData: TimespanPrice[],
): Decimal {
	const [timespanPrice, ...remainingPriceData] = priceData;
	const [nextTimespanPrice] = remainingPriceData;

	if (!timespanPrice) return new Decimal(0);

	const timespanStart = startTimestamp
	const timespanEnd = Math.min(nextTimespanPrice ? nextTimespanPrice.start : Infinity, endTimestamp);

	const amountWei = new Decimal(timespanEnd - timespanStart).mul(new Decimal(flowRate));
	const amountEther = new Decimal(formatEther(BigInt(amountWei.toFixed())));
	const amountFiat = amountEther.mul(new Decimal(timespanPrice.price.toString()));
	const newTotal = currentTotal.add(amountFiat);

	if (!nextTimespanPrice) return newTotal;

	return mapPriceDataToVirtualStreamPeriodRecursive(
		newTotal,
		flowRate,
		timespanEnd,
		endTimestamp,
		remainingPriceData,
	);
}

function _mergeTransfersIntoStreamPeriods(
	virtualizedStreamPeriods: StreamPeriod[],
	virtualizedTransfers: StreamPeriod[],
): { processedStreamPeriods: StreamPeriod[]; unmergedTransfers: StreamPeriod[] } {
	// Deep copy stream periods to avoid modifying the original array and its objects
	const processedStreamPeriods = virtualizedStreamPeriods.map(sp => ({
		...sp,
		virtualPeriods: sp.virtualPeriods.map(vp => ({ ...vp })), 
	}));
	
	const unmergedTransfers: StreamPeriod[] = [];

	for (const transfer of virtualizedTransfers) {
		const transferVp = transfer.virtualPeriods[0]; // Transfers have one virtual period
		let wasTransferMerged = false;

		for (const streamPeriod of processedStreamPeriods) {

			if (transfer.token.id !== streamPeriod.token.id || 
				transfer.chainId !== streamPeriod.chainId ||
				transfer.sender !== streamPeriod.sender ||
				transfer.receiver !== streamPeriod.receiver
			) {
				continue;
			}

			for (const vp of streamPeriod.virtualPeriods) {
				// Check if the transfer's timestamp falls within the virtual period's range
				if (transferVp.startTime >= vp.startTime && transferVp.startTime <= vp.endTime) {
					const currentVpAmount = new Decimal(vp.amount);
					const currentVpAmountFiat = new Decimal(vp.amountFiat ?? 0);
					
					const transferAmount = new Decimal(transferVp.amount);
					const transferAmountFiat = new Decimal(transferVp.amountFiat ?? 0);

					vp.amount = currentVpAmount.add(transferAmount).toFixed();
					vp.amountFiat = currentVpAmountFiat.add(transferAmountFiat).toFixed(18);
					
					// Add to the parent stream period's totalAmountStreamed
					const currentTotalAmountStreamed = new Decimal(streamPeriod.totalAmountStreamed);
					streamPeriod.totalAmountStreamed = currentTotalAmountStreamed.add(transferAmount).toFixed();

					wasTransferMerged = true;
					break; // Transfer merged into this vp, stop checking other vps for this streamPeriod
				}
			}

			if (wasTransferMerged) {
				break; // Transfer merged into a vp of this streamPeriod, move to the next transfer
			}
		}

		if (!wasTransferMerged) {
			unmergedTransfers.push(transfer);
		}
	}
	return { processedStreamPeriods, unmergedTransfers };
}
