import { NextResponse } from 'next/server';

export async function GET() {
    const yamlBody = `
info:
  version: 0.2.0
  title: Superfluid Accounting API
  description: Simple API to fetch all stream data needed for accounting.
servers:
  - url: ${process.env.APP_URL}
openapi: 3.0.0
components:
  schemas:
    VirtualizationPeriod:
      type: string
      enum:
        - hour
        - day
        - week
        - month
        - year
    Currency:
      type: string
      enum:
        - USD
        - EUR
        - AUD
        - BRL
        - CAD
        - CHF
        - CNY
        - GBP
        - HKD
        - INR
        - JPY
        - KRW
        - MXN
        - NOK
        - RUB
        - SEK
    Network:
      type: number
      enum:
        - 1
        - 10
        - 56
        - 100
        - 137
        - 42161
        - 42220
        - 43114
        - 8453
        - 11155420
        - 666666666
    Token:
      type: object
      properties:
        id:
          type: string
        symbol:
          type: string
        name:
          type: string
        underlyingAddress:
          type: string
    VirtualPeriod:
      type: object
      properties:
        startTime:
          type: number
        endTime:
          type: number
        amount:
          type: string
        amountFiat:
          type: string
    StreamPeriod:
      type: object
      properties:
        id:
          type: string
        flowRate:
          type: string
        token:
          $ref: '#/components/schemas/Token'
        chainId:
          $ref: '#/components/schemas/Network'
        sender:
          type: string
        receiver:
          type: string
        startedAtTimestamp:
          type: number
        startedAtBlockNumber:
          type: number
        startedAtEvent:
          type: string
        stoppedAtTimestamp:
          type: number
        stoppedAtBlockNumber:
          type: number
        stoppedAtEvent:
          type: string
        totalAmountStreamed:
          type: string
        virtualPeriods:
          type: array
          items:
            $ref: '#/components/schemas/VirtualPeriod'
      required:
        - id
        - flowRate
        - token
        - chainId
        - sender
        - receiver
        - startedAtTimestamp
        - startedAtBlockNumber
        - startedAtEvent
        - totalAmountStreamed
  parameters: {}
paths:
  /v1/stream-periods:
    get:
      description: Fetch virtualized stream periods
      parameters:
        - in: query
          name: chains
          required: true
          description: Number array for the Chain IDs you want to limit your accounting data to.
          schema:
            type: array
            example: '10,56,100,137'
            items:
              $ref: '#/components/schemas/Network'
        - in: query
          name: addresses
          required: true
          explode: false
          description: The addresses array you’re getting accounting data for.
          schema:
            type: array
            example: '0xe38ffDD2B0B8bb7E93D409f4A282714b18B77980,0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac'
            items:
              type: string
        - in: query
          name: start
          required: true
          description: The Unix timestamp where your accounting data is to start from.
          schema:
            type: number
            example: 1638309600
        - in: query
          name: end
          required: true
          description: The Unix timestamp where your accounting data is to end.
          schema:
            type: number
            example: 1669845599
        - in: query
          name: priceGranularity
          required: true
          description: When getting pricing data for each accounting record, you have the choice as to whether you want the instanteous price at the end of the timeframe of the accounting record or the average price over a certain lag from the end of the timeframe of the accounting record.
          schema:
            $ref: '#/components/schemas/VirtualizationPeriod'
        - in: query
          name: virtualization
          required: true
          description: The duration represented in each accounting record in your accounting data. (NB! Please use hourly period with small timeframe or single sender/receiver address.)
          schema:
            $ref: '#/components/schemas/VirtualizationPeriod'
        - in: query
          name: currency
          required: true
          description: The currency with which price data will be displayed in.
          schema:
            $ref: '#/components/schemas/Currency'
        - in: query
          name: counterparties
          explode: false
          description: Addresses that are either sending or receiving streams from the addresses account(s) that you want to limit your accounting data to.
          schema:
            type: array
            example: 0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac,0x7269B0c7C831598465a9EB17F6c5a03331353dAF
            items:
              type: string
      responses:
        "200":
          description: Array of stream periods containing virtualized periods.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StreamPeriod"

`;

    return new NextResponse(yamlBody, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
        },
    });
}