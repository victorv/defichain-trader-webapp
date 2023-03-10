export const calcProfitLoss = (desiredResult, estimate) => {
    return Math.round((100 / desiredResult * estimate - 100) * 100) / 100
}

export const hasItems = array => Array.isArray(array) && array.length > 0

export const round = number => Math.round(number * 100000000) / 100000000

export const roundTo = (number, decimals) => {
    const m = Math.pow(10, decimals)
    return Math.round(number * m) / m
}

export const asShortAmount = num => {
    const maxDigits = num < 1000.0 ? 2 : 0
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: maxDigits,
    }).format(num).substring(1)
}

export const avg = (a, b) => {
    if (!b) {
        return 0
    }
    return (b / a).toFixed(8)
}

export const formatAmount = num => {
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: 8,
    }).format(num).substring(1)
}

export const asTokenAmount = num => {
    let absNum = Math.abs(num)
    let digits = Math.round(Math.min(8, 8000 / (absNum == 0 ? 8000000 : absNum)))
    const formatted = new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: digits,
    }).format(absNum).substring(1)
    return num < 0 ? `-${formatted}` : formatted
}

export const asDollars = num => {
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: 0,
    }).format(num)
}

export const getTokenSymbols = (tokens, defaults, prefix) => {
    const allTokens = tokens.concat([
        'Crypto',
        'Stock',
        'DUSD_or_stock',
        'USDT_or_USDC',
        'is_sold_or_bought',
        'Any'
    ])

    const separator = '+to+'
    const hash = location.hash
    if (!hash) {
        return defaults
    }

    if (hash.startsWith(prefix) && hash.includes(separator) > 0) {
        const swap = hash.substring(prefix.length).split(separator)
        if (swap.length === 2) {
            const fromTokenSymbol = swap[0]
            const toTokenSymbol = swap[1]

            if(allTokens.includes(fromTokenSymbol) && allTokens.includes(toTokenSymbol)) {
                return {
                    fromTokenSymbol,
                    toTokenSymbol
                }
            }
        }
    }

    return defaults
}

export function isLocalhost() {
    const hostname = window.location.hostname
    return hostname === 'localhost' || hostname === '127.0.0.1';
}