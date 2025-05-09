import { getUnixTime, sub } from 'date-fns';
import { getVirtualizedStreamPeriods } from '@/services/StreamPeriodsService';
import { CurrencyCode } from '@/utils/CurrencyUtils';
import { VirtualizationPeriod, VirtualizationUnitOfTimeMap } from '@/utils/DateUtils';
import { NextRequest, NextResponse } from 'next/server';
import { AccountingQuery } from '@/utils/AccountQuery';
import { z } from 'zod';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Convert URLSearchParams to a plain object suitable for Zod parsing
		// This handles repeated query parameters by creating arrays for them.
		const queryToParse: { [key: string]: string | string[] } = {};
		searchParams.forEach((value, key) => {
			const existing = queryToParse[key];
			if (existing) {
				if (Array.isArray(existing)) {
					existing.push(value);
				} else {
					queryToParse[key] = [existing, value]; // Convert to array if it's the second occurrence
				}
			} else {
				queryToParse[key] = value; // First occurrence
			}
		});

		const { chains, addresses, start, end, virtualization, currency, priceGranularity, counterparties } =
			AccountingQuery.parse(queryToParse);
		// Hourly price granularity can not be used with data older than 90 days.
		// Note: 'start' here is a string (or undefined, or string[]) from parsing.
		// It's converted to Number for the check.
		// You might need to adjust if 'start' could be an array based on your schema and usage.
		if (
			start && typeof start === 'string' && // Ensure start is a string before Number()
			priceGranularity === VirtualizationPeriod.Hour &&
			getUnixTime(sub(new Date(), { days: 89, hours: 23, minutes: 59 })) > Number(start)
		) {
			return NextResponse.json(
				{ message: 'Hourly price granularity can not be used with data older than 90 days.' },
				{ status: 400 }
			);
		}

		const virtualizedStreamPeriods = await getVirtualizedStreamPeriods(
			addresses, // Assuming these are correctly parsed as string[] by Zod if multiple
			chains,    // Assuming these are correctly parsed as string[] by Zod if multiple
			Number(start), // Ensure start and end are converted to numbers if they are defined and single
			Number(end),
			VirtualizationUnitOfTimeMap[virtualization],
			counterparties, // Assuming these are correctly parsed as string[] by Zod if multiple
			currency as CurrencyCode,
			VirtualizationUnitOfTimeMap[priceGranularity],
		);

		return NextResponse.json(virtualizedStreamPeriods, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return NextResponse.json({ message: 'Validation error', errors: e.errors }, { status: 400 });
		} else {
			console.error('GET Error:', e); 
			return NextResponse.json({ message: e.message || 'Internal Server Error' }, { status: 500 });
		}
	}
}
