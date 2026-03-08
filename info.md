# Automated Market Makers (AMMs)

You’re describing how **Automated Market Makers (AMMs)** work in decentralized exchanges. The most common rule used is the **constant product formula**:

[
x \times y = k
]

Where:

* **x** = amount of Asset A in the pool
* **y** = amount of Asset B in the pool
* **k** = constant value (must stay the same)

This model is used by protocols like Uniswap.

Let’s break it down **in simple language**.

---

## 1. Simple Idea

A liquidity pool always contains **two assets**.

Example pool:

* Asset A = Apples 🍎
* Asset B = Bananas 🍌

Suppose the pool has:

* 100 Apples
* 100 Bananas

So:

[
100 \times 100 = 10,000
]

That **10,000 must always stay constant**.

---

## 2. What Happens When Someone Trades

A trader wants **Apples**, and they pay using **Bananas**.

So they:

* **Add Bananas** to the pool
* **Remove Apples** from the pool

But the product must remain **10,000**.

---

### Example Trade

Initial pool:

* Apples = 100
* Bananas = 100

[
100 \times 100 = 10,000
]

Now a trader adds **20 Bananas**.

Pool becomes:

* Bananas = 120
* Apples = ?

To keep the constant:

[
Apples \times 120 = 10,000
]

[
Apples = 83.33
]

So the trader removes:

[
100 - 83.33 = 16.67 \text{ Apples}
]

---

## 3. What Just Happened (Important Insight)

The pool now has:

* Apples = **83.33**
* Bananas = **120**

Because **Apples became scarce**, their **price increased**.

Because **Bananas increased in supply**, their **price decreased**.

---

## 4. Real Life Analogy (Fruit Stall)

Imagine a fruit stall rule:

> “Total value of apples × bananas must stay fixed.”

If many people **buy apples**:

* Apples become **rare**
* Seller raises **apple price**

If many people **sell bananas**:

* Bananas become **abundant**
* Seller lowers **banana price**

The system automatically adjusts prices **without a human market maker**.

---

## 5. Why Price Changes

Price in AMM is basically the **ratio of the two assets**.

[
Price\ of\ Apple = \frac{Bananas}{Apples}
]

Initially:

[
100/100 = 1
]

After trade:

[
120/83.33 \approx 1.44
]

So **Apple price increased**.

---

## 6. One Important Concept: Slippage

If someone tries to buy **a lot of apples**, they must:

* Add **many bananas**
* Remove **many apples**

But apples become rarer **during the trade**, so the price keeps increasing.

That’s called **slippage**.

---

✅ **In one sentence**

When someone buys Asset A with Asset B in an AMM pool, they add B and remove A, and the constant product formula forces the price of A to increase because its supply in the pool decreases.

---

If you want, I can also explain **why liquidity providers earn fees and what impermanent loss is**, which is the next concept after this. It becomes very clear once you understand this formula.
