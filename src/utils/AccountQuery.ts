import { z } from 'zod';
import { networks } from '@/utils/Network';
import { CurrencyCode } from '@/utils/CurrencyUtils';
import { VirtualizationPeriod } from '@/utils/DateUtils';

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