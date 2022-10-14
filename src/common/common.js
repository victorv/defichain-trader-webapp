export const calcProfitLoss = poolSwap => {
    return Math.round((100 / poolSwap.desiredResult * poolSwap.estimate - 100) * 100) / 100
}

export const hasItems = array => Array.isArray(array) && array.length > 0

export const round = number => Math.round(number * 100000000) / 100000000

export const asDollars = num => {
    return new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
        maximumFractionDigits: 0,
    }).format(num)
}