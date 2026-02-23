# Bond Yield Calculator

A web application that calculates bond yield metrics and generates cash flow schedules. Built with React, NestJS, and TypeScript.

## Tech Stack

- **Frontend:** React 18 + Vite + Material UI 5
- **Backend:** NestJS 10
- **Language:** TypeScript throughout
- **Styling:** CSS custom properties with dark/light theme support, Inter font
- **Testing:** Jest with ts-jest

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone <repo-url>
cd bond-yield-calculator
npm install
```

### Running in Development

Start the backend and frontend in two separate terminals:

```bash
# Terminal 1 - Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev:frontend
```

The frontend proxies `/api` requests to the backend automatically.

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
bond-yield-calculator/
├── shared/                        # Shared TypeScript types
│   └── src/types/bond.types.ts    # API contract interfaces
├── backend/                       # NestJS API
│   └── src/
│       ├── main.ts                # Bootstrap, port 3000, validation pipe
│       ├── app.module.ts
│       └── bond/
│           ├── bond.service.ts    # Core financial calculations
│           ├── bond.controller.ts # POST /api/bond/calculate
│           ├── dto/               # Input validation
│           └── __tests__/         # Unit tests
└── frontend/                      # React + Vite
    └── src/
        ├── App.tsx                # Root component
        ├── components/            # BondForm, BondResults, CashFlowTable
        ├── context/               # Theme provider (dark/light)
        ├── hooks/                 # useBondCalculation
        ├── api/                   # API client
        └── utils/                 # Formatters
```

## API

### `POST /api/bond/calculate`

**Request body:**

| Field             | Type   | Constraints                      |
| ----------------- | ------ | -------------------------------- |
| faceValue         | number | Positive                         |
| annualCouponRate  | number | 0 - 100                          |
| marketPrice       | number | Positive                         |
| yearsToMaturity   | number | Positive, max 100                |
| couponFrequency   | string | `"annual"` or `"semi-annual"`    |

**Response body:**

| Field                | Type     | Description                          |
| -------------------- | -------- | ------------------------------------ |
| currentYield         | number   | Current yield percentage             |
| yieldToMaturity      | number   | YTM percentage                       |
| totalInterestEarned  | number   | Sum of all coupon payments           |
| premiumOrDiscount    | string   | `"premium"`, `"discount"`, or `"par"`|
| premiumDiscountAmount| number   | Absolute difference from face value  |
| cashFlowSchedule     | array    | Period-by-period payment schedule    |

---

## Bond Calculation Concepts

### What is a Bond?

A bond is a fixed-income instrument where an investor lends money to an issuer (government or corporation) for a defined period. The issuer pays periodic interest (coupons) and returns the principal (face value) at maturity.

### Key Terms

#### Face Value (Par Value)

The principal amount of the bond, returned to the bondholder at maturity. This is the nominal value printed on the bond. For example, a bond with a face value of $1,000 means the issuer will pay $1,000 back when the bond matures.

#### Annual Coupon Rate

The annual interest rate the issuer pays, expressed as a percentage of the face value. A 5% coupon rate on a $1,000 bond means the issuer pays $50 per year in interest. This rate is fixed at the time the bond is issued and does not change.

#### Market Price

The current trading price of the bond in the secondary market. This can be above, below, or equal to the face value depending on market interest rates, credit risk, and time to maturity. It is the price an investor actually pays to buy the bond today.

#### Years to Maturity

The remaining time until the bond's principal is repaid. A bond issued for 10 years with 3 years elapsed has 7 years to maturity. Longer maturities generally carry more interest rate risk.

#### Coupon Frequency

How often coupon payments are made:
- **Annual:** One payment per year. A $1,000 bond at 5% pays $50 once a year.
- **Semi-annual:** Two payments per year. The same bond pays $25 every six months.

#### Premium, Discount, and Par

- **Premium:** The bond trades above its face value (market price > face value). This happens when the bond's coupon rate is higher than prevailing market rates, making it more attractive.
- **Discount:** The bond trades below its face value (market price < face value). This happens when the bond's coupon rate is lower than prevailing market rates.
- **Par:** The bond trades at exactly its face value. This typically occurs when the coupon rate equals the market rate.

---

### Calculated Outputs

#### Current Yield

The annual income relative to the market price. It measures the return an investor gets from coupon payments alone, without considering capital gains or losses at maturity.

```
Current Yield = (Annual Coupon Payment / Market Price) x 100
```

**Example:** A bond with a $1,000 face value, 5% coupon rate, and a market price of $950:
```
Annual Coupon = $1,000 x 5% = $50
Current Yield = ($50 / $950) x 100 = 5.26%
```

Current yield is a simple measure but does not account for the time value of money or the gain/loss when the bond matures at face value.

#### Yield to Maturity (YTM)

The total annualized return an investor earns if the bond is held until maturity. Unlike current yield, YTM accounts for:
- All coupon payments
- The difference between market price and face value (capital gain or loss)
- The time value of money (discounting future cash flows)

YTM is the discount rate `r` that makes the present value of all future cash flows equal to the market price:

```
Market Price = C/(1+r)^1 + C/(1+r)^2 + ... + C/(1+r)^n + F/(1+r)^n
```

Where:
- `C` = coupon payment per period
- `F` = face value
- `n` = total number of periods
- `r` = yield per period (what we solve for)

This equation has no closed-form algebraic solution, so this application uses the **Newton-Raphson method** to solve it iteratively:

1. Start with an initial estimate using the approximation: `r = (C + (F - P) / n) / ((F + P) / 2)`
2. Calculate the bond price and its derivative at the current rate
3. Refine the rate: `r_new = r - f(r) / f'(r)`
4. Repeat until the change is less than 0.0000000001 (convergence tolerance of 1e-10)

For **zero-coupon bonds** (no coupon payments), a direct formula is used instead:
```
YTM = (Face Value / Market Price)^(1/n) - 1
```

**Key insight:** When a bond trades at par, the YTM equals the coupon rate. When it trades at a discount, the YTM is higher than the coupon rate (the investor gains from both coupons and the price appreciation). When it trades at a premium, the YTM is lower (the capital loss at maturity offsets some coupon income).

#### Total Interest Earned

The total nominal coupon income received over the entire life of the bond:

```
Total Interest = Coupon Payment Per Period x Total Number of Periods
```

**Example:** A $1,000 bond at 5% held for 10 years with annual payments:
```
Total Interest = $50 x 10 = $500
```

With semi-annual payments, the per-period payment is $25 but there are 20 periods, so the total is still $500. The total is the same regardless of frequency; only the payment timing differs.

#### Cash Flow Schedule

A period-by-period breakdown of the bond's payment stream, showing:

| Column               | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| Period               | Sequential payment number (1, 2, 3, ...)                                   |
| Payment Date         | When the coupon is paid, calculated from today at regular intervals         |
| Coupon Payment       | The fixed payment received each period                                      |
| Cumulative Interest  | Running total of all coupon payments received up to this period             |
| Remaining Principal  | The face value that has not yet been returned. This is the full face value for every period except the last, where it drops to $0 because the principal is repaid at maturity. |

**Example:** A $1,000 bond at 5% annual for 3 years:

| Period | Coupon Payment | Cumulative Interest | Remaining Principal |
| ------ | -------------- | ------------------- | ------------------- |
| 1      | $50.00         | $50.00              | $1,000.00           |
| 2      | $50.00         | $100.00             | $1,000.00           |
| 3      | $50.00         | $150.00             | $0.00               |

In the final period, the bondholder receives the last coupon ($50) plus the face value ($1,000), and the remaining principal drops to zero.

---

## Test Cases

The backend includes unit tests verifying calculations against known values:

| Scenario             | Face Value | Coupon | Price  | Years | Frequency   | Expected CY | Expected YTM |
| -------------------- | ---------- | ------ | ------ | ----- | ----------- | ------------ | ------------ |
| Discount bond        | $1,000     | 5%     | $950   | 10    | Annual      | ~5.26%       | ~5.67%       |
| Premium bond         | $1,000     | 8%     | $1,100 | 5     | Semi-Annual | ~7.27%       | ~5.69%       |
| Par bond             | $1,000     | 6%     | $1,000 | 5     | Annual      | 6.00%        | 6.00%        |
| Zero-coupon bond     | $1,000     | 0%     | $600   | 10    | Annual      | 0%           | ~5.24%       |
