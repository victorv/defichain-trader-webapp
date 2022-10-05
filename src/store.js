import {writable} from "svelte/store";

let activeAccount
let activeState

const getPoolSwapsFromLocalStorage = () => {
    if (!localStorage) {
        return []
    }
    const item = localStorage.getItem("poolSwaps")
    if (!item) {
        return []
    }

    const poolSwaps = JSON.parse(item)
    if (Array.isArray(poolSwaps)) {
        return poolSwaps
    }
    return []
}

export const messages = writable({connected: false})

export const store = writable({
    poolSwaps: getPoolSwapsFromLocalStorage(),
    tokenSymbolsById: {},
})

export function setAccount(account) {
    activeAccount = account
    updateStore({
        account,
        poolSwaps: account.poolSwaps.map(swap => ({
            ...swap,
            estimates: swap.estimates.map(pair => ({
                timestamp: new Date(pair.first).toLocaleTimeString(),
                estimate: pair.second
            }))
        })),
    })

    store.update(state => {
        console.log(state)
        return state
    })
}

export function logout() {
    window.location.reload()
}

async function updateAccount(poolSwaps) {
    if (!activeAccount) {
        return
    }

    const response = await fetch(`/account`, {
        method: 'POST',
        body: JSON.stringify({
            chatID: activeAccount.chatID,
            poolSwaps: poolSwaps.map(swap => ({
                amountFrom: swap.amountFrom,
                desiredResult: swap.desiredResult,
                tokenFrom: swap.tokenFrom,
                tokenTo: swap.tokenTo,
            })),
        }),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Unable to update account')
    }
}


export async function addPoolSwap(poolSwap) {
    const poolSwaps = activeState.poolSwaps
        .map(poolSwap => ({
            ...poolSwap,
            graph: false,
            showBreakdown: false,
        }))
        .concat({
            ...poolSwap,
            showBreakdown: true
        })
    await updateAccount(poolSwaps)
    updateStore({poolSwaps})
}

export function updateStore(updates) {
    store.update(state => ({
        ...state,
        ...updates,
    }))
}

export async function removePoolSwap(atIndex) {
    const poolSwaps = activeState.poolSwaps.filter((_, index) => index !== atIndex)
    await updateAccount(poolSwaps)
    updateStore({poolSwaps})
}

store.subscribe(state => {
    activeState = state
    if (!localStorage) {
        return
    }
    if (!activeAccount) {
        localStorage.setItem("poolSwaps", JSON.stringify(state.poolSwaps || []))
    }
})