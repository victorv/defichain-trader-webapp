export const isWorseDefaultPath = (poolSwap, breakdown) => {
    if (breakdown.swaps.length > 1) {
        return false
    }
    console.log(poolSwap.breakdown[0].path, breakdown.path)
    return poolSwap.breakdown[0].path !== breakdown.path
}

export const getHeader = (poolSwap, index) => {
    if (index === 0) {
        return 'Best path'
    }

    const breakdown = poolSwap.breakdown[index]
    if (isWorseDefaultPath(poolSwap, breakdown)) {
        return `Worse direct path`
    }
    return 'Worse path'
}