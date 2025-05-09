import { getUnixTime, sub } from 'date-fns';
import { getVirtualizedStreamPeriods } from '@/services/StreamPeriodsService';
import { CurrencyCode } from '@/utils/CurrencyUtils';
import { VirtualizationPeriod, VirtualizationUnitOfTimeMap } from '@/utils/DateUtils';
import { networks } from '@/utils/Network';
import { NextApiRequest, NextApiResponse } from 'next';

import { z } from 'zod';

const parseAddressesString = (addresses: string): Array<string> =>
	addresses
		.split(',')
		.filter((addr) => !!addr)
		.map((addr) => addr.toLowerCase());

export const AccountingQuery = z.object({
	chains: z
		.string()
		.transform((chains) => chains.split(',').map((chain) => networks[Number(chain)])) // Map to networks
		.refine((chains) => !chains.some((chain) => !chain)), // Checking for null values
	addresses: z
		.string()
		.transform(parseAddressesString)
		.refine((addresses) => addresses.length > 0, 'At least one address is required!'),
	start: z.preprocess((start) => Number(start), z.number()),
	end: z.preprocess((end) => Number(end), z.number()),
	priceGranularity: z.nativeEnum(VirtualizationPeriod),
	virtualization: z.nativeEnum(VirtualizationPeriod),
	currency: z.nativeEnum(CurrencyCode),
	counterparties: z.string().optional().default('').transform(parseAddressesString),
});

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { chains, addresses, start, end, virtualization, currency, priceGranularity, counterparties } =
			AccountingQuery.parse(req.query);

		// Hourly price granularity can not be used with data older than 90 days.
		// This is currently a limitation by CoinGecko API we are using.
		// More info here: https://www.coingecko.com/en/api/documentation
		if (
			start &&
			priceGranularity === VirtualizationPeriod.Hour &&
			getUnixTime(sub(new Date(), { days: 89, hours: 23, minutes: 59 })) > start
		) {
			res.status(400).send('Hourly price granularity can not be used with data older than 90 days.');
			return;
		}

		const virtualizedStreamPeriods = await getVirtualizedStreamPeriods(
			addresses,
			chains,
			Number(start),
			Number(end),
			VirtualizationUnitOfTimeMap[virtualization],
			counterparties,
			currency as CurrencyCode,
			VirtualizationUnitOfTimeMap[priceGranularity],
		);

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.status(200).json(virtualizedStreamPeriods);
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			res.status(400).json({ message: 'Validation error', errors: e.errors });
		} else {
			res.status(500).send(e.message);
		}
	}
};
