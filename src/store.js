import {writable} from "svelte/store";

export const incomingMessages = writable({connected: false})
export const outgoingMessages = writable(null)

export const store = writable({
    account: {},
})

export const removePoolswap = async swap => {
    outgoingMessages.set(swap)
}

export const addPoolswap = async swap => {
    outgoingMessages.set(swap)
}