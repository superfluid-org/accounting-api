# Superfluid Accounting API

Streams move value every second, but accounting tools don’t record value transfer on a real-time basis (typically it’s monthly). The Stream Accounting API can be used to represent your streams in a manner that’s consumable by your traditional accounting tools.

More info about using the Accounting API can be found [here](https://superfluidhq.notion.site/Using-the-Stream-Accounting-API-3d161745acfe4750acf43c546f84c724)

## Running locally

1) Install node modules:
```
pnpm install
```

2) Run development mode
```
pnpm dev
```

3) Local server will start at
```
http://localhost:3000
```

## API endpoints

### Virtualized stream periods

**URL**
`https://accounting.superfluid.dev/v1/stream-periods`

**Query params:**
`chains` - **string** (chain ID-s separated by comma) <br />
`addresses` - **string** (addresses separated by comma) <br />
`start` - **number** (unix timestamp) <br />
`end` - **number** (unix timestamp) <br />
`priceGranularity` - **VirtualizationPeriod** hour, day, week, month or year period <br />
`virtualization` - **VirtualizationPeriod** hour, day, week, month or year period <br />
`currency` - **CurrencyCode** (ISO 3-Letter Currency Code) <br />
`counterparties` - **string** (addresses separated by comma). This field is optional. If no counterparties are provided, everyone will be selected <br />

**Example request**
```
https://accounting.superfluid.dev/v1/stream-periods?addresses=0xe38ffDD2B0B8bb7E93D409f4A282714b18B77980&chains=100%2C137%2C10%2C42161%2C42220%2C43114%2C56&start=1638309600&end=1669845599&priceGranularity=day&virtualization=month&currency=USD&counterparties=0x7BDa037dFdf9CD9Ad261D27f489924aebbcE71Ac%2C0x7269B0c7C831598465a9EB17F6c5a03331353dAF
```

*VirtualizationPeriod*
```
hour (Use at risk! This can fail due to too large response. Try using smaller timeframe or single address.)
day
week
month
year
```

*Supported currencies:*
```
USD
EUR
AUD
BRL
CAD
CHF
CNY
GBP
HKD
INR
JPY
KRW
MXN
NOK
RUB
SEK
```

### Swagger Documentation

**URL**
`https://accounting.superfluid.dev/v1/swagger`

### OpenAPI Configuration

**URL**
`https://accounting.superfluid.dev/api-docs.yaml`