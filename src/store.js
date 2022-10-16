import {writable} from "svelte/store";

export const incomingMessages = writable({connected: false})
export const outgoingMessages = writable(null)
export const mempool = writable([])
export const swaps = writable([])
export const graphStore = writable({})

const getSwapID = swap => {
    return `${swap.tokenFrom}+${swap.tokenTo}+${swap.amountFrom}+${swap.desiredResult}`
}

const storePoolSwaps = swaps => {
    if (localStorage) {
        localStorage.setItem("poolSwaps", JSON.stringify(swaps.map(
            swap => ({
                amountFrom: swap.amountFrom,
                tokenFrom: swap.tokenFrom,
                tokenTo: swap.tokenTo,
                desiredResult: swap.desiredResult,
            })
        )))
    }
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
                const updated = swaps.concat(message.data)
                storePoolSwaps(updated)
                return updated
            }

            const updated = swaps.map(swap =>
                ({
                    ...swap,
                    ...(getSwapID(swap) === swapID ? message.data : {}),
                })
            )
            storePoolSwaps(updated)
            return updated
        })
    } else if (message.id === 'swaps-removed') {
        const removedSwaps = new Set(message.data.map(removedSwap => getSwapID(removedSwap)))
        swaps.update(swaps => {
            const updated = swaps.filter(swap => !removedSwaps.has(getSwapID(swap)))
            storePoolSwaps(updated)
            return updated
        })
    } else if (message.id === 'graph-data-point') {
        graphStore.set(message.data)
    }
})

export const store = writable({
    account: {},
})

export const setGraph = (fromToken, toToken) => {
    outgoingMessages.set({
        id: 'set-graph',
        data: {
            fromToken,
            toToken
        },
    })
    mempool.set([])
}

export const removePoolswap = swap => {
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

export const addPoolswap = swap => {
    outgoingMessages.set({
        id: 'add-swap',
        data: {
            tokenFrom: swap.tokenFrom,
            tokenTo: swap.tokenTo,
            amountFrom: swap.amountFrom,
            desiredResult: swap.desiredResult,
        },
    })
}