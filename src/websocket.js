import {writable} from "svelte/store";
import {auctionStore, getSwapID, mempool, orderStore, storePoolSwaps, swaps, uuidStore} from "./store";
import {isLocalhost} from "./common/common";

export const webSocketStore = writable({
    connected: false,
    connecting: true,
})
export const outgoingMessages = writable(null)
export const incomingMessages = writable({connected: false})

let socket
let error
let reconnectId

outgoingMessages.subscribe(message => {
    if (message != null) {
        socket.send(JSON.stringify(message))
    }
})

incomingMessages.subscribe(message => {
    if (message.id === 'uuid') {
        uuidStore.set(message.data)
    } else if (message.id === 'mempool-swap') {
        mempool.update(state => state.concat(message.data))
    } else if (message.id === 'block') {
        mempool.set([])
    } else if (message.id === 'orders') {
        orderStore.set(message.data)
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

const newSocket = () => {
    clearTimeout(reconnectId)

    webSocketStore.set({
        connecting: true,
        connected: false,
    })
    if (socket) {
        socket.onclose = function () {
        }
        socket.close()
    }

    const url = `${isLocalhost() ? 'ws' : 'wss'}://${window.location.host}/stream`
    console.log(url)
    socket = new WebSocket(url)

    window.onbeforeunload = function () {
        socket.onclose = function () {
        }
        socket.close()
    }

    socket.onopen = () => {
        webSocketStore.set({
            connecting: false,
            connected: true,
        })
        error = null

        const swaps = localStorage
            ? JSON.parse(localStorage.getItem('poolSwaps') || '[]')
            : []

        swaps.forEach(swap => addPoolswap(swap))
    }

    socket.onclose = function () {
        error = 'You are not connected to the server'
        webSocketStore.set({
            connected: false,
            connecting: false,
        })
        reconnectId = setTimeout(newSocket, 30000)
    }

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data)
        incomingMessages.set(message)
    }
}

newSocket()

export const setAddress = hasAddress => {
    if (hasAddress) {
        outgoingMessages.set({
            id: 'set-address',
            data: {},
        })
    } else {
        outgoingMessages.set({
            id: 'unset-address',
            data: {},
        })
    }
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

