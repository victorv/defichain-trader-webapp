import {writable} from "svelte/store";

export const incomingMessages = writable({connected: false})
export const outgoingMessages = writable(null)
export const mempool = writable([])
export const swaps = writable([])

const getSwapID = swap => {
    return `${swap.tokenFrom}+${swap.tokenTo}+${swap.amountFrom}+${swap.desiredResult}`
}

incomingMessages.subscribe(message => {
    if (message.id === 'mempool-swap') {
        mempool.update(state => state.concat(message.data))
    } else if (message.id === 'block') {
        mempool.set([])
    } else if (message.id === 'swap-result') {
        const swapID = getSwapID(message.data)

        swaps.update(swaps => {
            if (!swaps.find(swap => getSwapID(swap) === swapID)) {
                return swaps.concat(message.data)
            }

            return swaps.map(swap =>
                ({
                    ...swap,
                    ...(getSwapID(swap) === swapID ? message.data : {}),
                })
            )
        })
    } else if (message.id === 'swaps-removed') {
        const removedSwaps = new Set(message.data.map(removedSwap => getSwapID(removedSwap)))
        swaps.update(swaps => swaps.filter(swap => !removedSwaps.has(getSwapID(swap))))
    }
})

export const store = writable({
    account: {},
})

export const removePoolswap = async swap => {
    outgoingMessages.set({
        id: 'remove-swap',
        data: {
            tokenFrom: swap.tokenFrom,
            tokenTo: swap.tokenTo,
            amountFrom: swap.amountFrom,
            desiredResult: swap.desiredResult,
        },
    })
}

export const addPoolswap = async swap => {
    outgoingMessages.set({
        id: 'add-swap',
        data: swap,
    })
}