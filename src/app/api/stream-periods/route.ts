import { getUnixTime, sub } from 'date-fns';
import { getVirtualizedStreamPeriods } from '@/services/StreamPeriodsService';
import { CurrencyCode } from '@/utils/CurrencyUtils';
import { VirtualizationPeriod, VirtualizationUnitOfTimeMap } from '@/utils/DateUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { AccountingQuery } from '@/utils/AccountQuery';
import { z } from 'zod';

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
