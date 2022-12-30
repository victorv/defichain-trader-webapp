export const calcProfitLoss = (desiredResult, estimate) => {
    return Math.round((100 / desiredResult * estimate - 100) * 100) / 100
}

export const hasItems = array => Array.isArray(array) && array.length > 0

export const round = number => Math.round(number * 100000000) / 100000000

export const roundTo = (number, decimals) => {
    const m = Math.pow(10, decimals)
    return Math.round(number * m) / m
}

export const asUSDT = num => {
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: 2,
    }).format(num).substring(1) + ' USDT'
}

export const asDollars = num => {
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: 0,
    }).format(num)
}