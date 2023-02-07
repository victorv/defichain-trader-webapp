import {writable} from "svelte/store";

const cakeDeFiCustomerSwaps = {
    name: 'Cake DeFi: customer swaps',
    addresses: ['dSPPfAPY8BA3TQdqfZRnzJ7212HPWunDms'],
    builtin: true,
}

const cakeDeFiBuyBot = {
    name: 'Cake DeFi: buy-bot',
    addresses: ['df1qq8a2zvhpyk4wcec4f3meeck9k9y7e735w7tlpr'],
    builtin: true,
}

const DFIP2211B = {
    name: 'DFIP-2211-B: bot burns DUSD periodically',
    addresses: ['df1qlwvtdrh4a4zln3k56rqnx8chu8t0sqx36syaea'],
    builtin: true,
}

const DFIP2206D = {
    name: 'TICKER COUNCIL: bot burns DUSD periodically',
    addresses: ['df1qa6qjmtuh8fyzqyjjsrg567surxu43rx3na7yah'],
    builtin: true,
}

const DFIP2201A = {
    name: 'DFIP 2201-A: bot burns BTC periodically',
    addresses: ['df1qc8ptw6vc9588w6f53fvcjsjx0fntv3men407a9'],
    builtin: true,
}

const burnBots = {
    name: 'All burn bots',
    addresses: [...DFIP2201A.addresses, ...DFIP2211B.addresses, ...DFIP2206D.addresses],
    builtin: true,
}

const burnAddress = {
    name: 'DeFiChain: burn address',
    addresses: ['8defichainBurnAddressXXXXXXXdRQkSm'],
    builtin: true,
}

const builtinAddressGroups = [cakeDeFiBuyBot, cakeDeFiCustomerSwaps, DFIP2201A, DFIP2206D, DFIP2211B, burnBots, burnAddress]

const getAccount = () => {
    if (localStorage) {
        const item = localStorage.getItem('account')
        if (item) {
            const account = JSON.parse(item)
            if (account && typeof account === 'object') {
                if (account.addressGroups) {
                    return {
                        addressGroups: account.addressGroups
                            .filter(g => !g.builtin)
                            .concat(...builtinAddressGroups)
                    }
                }
                return {}
            }
        }
    }
    return {
        addressGroups: builtinAddressGroups
    }
}

export const accountStore = writable(getAccount())

export const updateAccount = partialAccount => {
    accountStore.update(account => ({
        ...account,
        ...partialAccount
    }))
}

accountStore.subscribe(account => {
    if (localStorage && account && typeof account === 'object') {
        localStorage.setItem('account', JSON.stringify(account))
    }
})

const getMempoolBlacklist = () => {
    if (localStorage) {
        const v = localStorage.getItem("mempoolBlacklist")
        try {
            const items = JSON.parse(v)
            if (Array.isArray(items)) {
                return items
            }
        } catch (e) {
            console.log(e)
        }
    }
    return []
}

const getFilter = () => {
    if (localStorage) {
        const item = localStorage.getItem('filter')
        if (item) {
            const filter = JSON.parse(item)
            if (filter && typeof filter === 'object') {
                delete filter.minBlock
                delete filter.maxBlock
                delete filter.fromAddress
                delete filter.toAddress
                delete filter.txID
                delete filter.pager
                return filter
            }
        }
    }
    return {}
}

export const webSocketStore = writable({
    connected: false,
    connecting: true,
})
export const auctionStore = writable([])
export const filterStore = writable(getFilter())
export const uuidStore = writable(null)
export const incomingMessages = writable({connected: false})
export const outgoingMessages = writable(null)
export const mempool = writable([])
export const swaps = writable([])
export const mempoolBlacklistStore = writable(getMempoolBlacklist())
export const screenStore = writable({
    large: false,
    small: true,
})

export const updateMempoolBlacklist = items => {
    mempoolBlacklistStore.set(items)
    if (localStorage) {
        localStorage.setItem("mempoolBlacklist", JSON.stringify(items))
    }
}

const mediaQuery = matchMedia('(max-width: 1200px)')
const updateBody = () => {
    const small = mediaQuery.matches
    screenStore.set({
        large: !small,
        small,
    })
    document.body.className = small ? 'small' : 'large'
}
updateBody()

mediaQuery.onchange = updateBody

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
    if (message.id === 'uuid') {
        uuidStore.set(message.data)
    } else if (message.id === 'mempool-swap') {
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
    } else if (message.id === 'auctions') {
        auctionStore.set(message.data)
    }
})

export const store = writable({
    account: {},
})

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