<svelte:options immutable/>
<script>
    import {onDestroy, onMount} from "svelte";
    import {createEncryptedWallet, CTransactionSegWit} from "../../public/lib/jellyfish";
    import LimitOrder from "./LimitOrder.svelte";
    import {getTokenID, uuidStore} from "../store";
    import BigNumber from "bignumber.js";
    import OrderOverview from "./OrderOverview.svelte";
    import {setAddress} from "../websocket";

    export let allTokens

    let subs = []
    let uuid

    let spendable = []
    const cryptoAndDUSD = ['DFI', 'DUSD', 'csETH', 'USDT', 'USDC', 'DOGE', 'BTC', 'BCH', 'LTC', 'ETH']

    let stock = allTokens.filter(token => !cryptoAndDUSD.includes(token))
    let balances = []
    let address
    let fromTokenSymbol
    let error
    let statusText
    let walletAccount
    let swap
    let password
    let dusdBalance = 0.0

    const encryptedKeys = {
        "pubKey": "0275cc4f36cfc6f254125640603d75af9f1403e21ea41720b52fc71ebe00456d2a",
        "chainCode": "68814de0e7bea01233e13745e5ca75cc256d2bf5738619cfb6efc32e2ee0c6d8",
        "encryptedPrivKey": "0142c03fa50017109fff007cdb6b360e451f785f60e3824a53174d465994edf1cef04b28a4b40cfaeea36d6479acf1d713d35c71aeff354c50880919170a20e3805d4b19e8849a"
    }

    const cancel = () => {
        fromTokenSymbol = null
    }

    const submit = async newSwap => {
        fromTokenSymbol = null
        swap = {
            ...newSwap,
            tokenFrom: 'DUSD',
            tokenTo: newSwap.token,
        }
        console.log(swap)
    }

    const signSwap = async () => {
        error = null
        statusText = 'Submitting transaction...'
        try {
            const script = await walletAccount.getScript()

            const builder = walletAccount.withTransactionBuilder()

            spendable = await fetchSpendable()
            const input = spendable[Math.floor(Math.random() * spendable.length)]

            const signedTX = await builder.dex.poolSwap(
                {
                    fromAmount: BigNumber(swap.quantity),
                    fromScript: script,
                    toScript: script,
                    fromTokenId: getTokenID(swap.tokenFrom),
                    toTokenId: getTokenID(swap.tokenTo),
                    maxPrice: BigNumber(swap.targetPrice)
                },
                script,
            )

            const index = signedTX.vin.findIndex(v => v.txid === input.txid)

            // firstInput.txid = input.txid
            // firstInput.index = input.number
            console.log(signedTX.vin)
            console.log(signedTX.witness)
            signedTX.vin = [signedTX.vin[0]]
            signedTX.witness = [signedTX.witness[0]]
            console.log(signedTX)

            const rawSignedTX = new CTransactionSegWit(signedTX).toHex()
            console.log(rawSignedTX)
            await submitOrder(swap, rawSignedTX)
        } catch (e) {
            error = 'invalid password'
            console.log(e)
        } finally {
            swap = null
            password = ''
            statusText = ''
        }
    }

    const submitOrder = async(swap, signedTX) => {
        await fetch(`/submit-order?uuid=${uuid}`, {
            method: 'POST',
            body: JSON.stringify({
                tokenFrom: swap.tokenFrom,
                tokenTo: swap.tokenTo,
                amountFrom: +swap.quantity,
                maxPrice: +swap.targetPrice,
                signedTX
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
    }

    const fetchSpendable = async () => {
        const fetchUnspent = await fetch(`https://ocean.defichain.com/v0/mainnet/address/df1q23dwsp4k9zache7zmmxlfpfap6yp3u3dx4q7hr/transactions/unspent?size=50`)
        const unspent = await fetchUnspent.json()
        const largeUnspent = (unspent.data || [])
            .filter(u => u.vout && +u.vout.value > 0.005)
            .map(u => u.vout)

        const fetchSpendable = await fetch(`/spendable`, {
            method: 'POST',
            body: JSON.stringify(largeUnspent.map(s => s.txid)),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        const spendableTXIds = await fetchSpendable.json()
        return largeUnspent
            .filter(s => spendableTXIds.includes(s.txid))
            .map(s => (
                {
                    txid: s.txid,
                    number: s.n,
                }
            ))
    }

    onMount(async () => {
        setAddress(true)

        subs.push(uuidStore.subscribe(newUUID => {
            uuid = newUUID
        }))

        const wallet = await createEncryptedWallet(encryptedKeys, async () => {
            return password.trim()
        })
        walletAccount = wallet.get(0)
        address = await walletAccount.getAddress()

        const request = await fetch(`/account?address=${address}`)
        const response = await request.json()
        balances = Object.entries(response).map(pair => ({
            token: pair[0],
            amount: pair[1]
        }))

        const dusd = balances.find(balance => balance.token === 'DUSD')
        if (dusd) {
            dusdBalance = dusd.amount
        }
        spendable = await fetchSpendable()
    })

    onDestroy(() => {
        subs.forEach(sub => sub())
        setAddress(false)
    })
</script>

<p class="server">
    {#if address}
        {address}
        <br/>
        <span class="amount">{spendable.length}</span>
        <span class="token">unspent</span>
        <ul class="server">
            {#each balances as balance}
                <li>
                    <button on:click={() => {error = null; fromTokenSymbol = balance.token}}
                            class="pure-button primary-button">Buy Stock
                    </button>
                    <span class="amount">{balance.amount}</span>
                    <span class="token">{balance.token}</span>
                </li>
            {/each}
        </ul>
    {/if}

    {#if fromTokenSymbol}
        <LimitOrder {cancel}
                    {submit}
                    {dusdBalance}
                    allTokens={stock}
                    {fromTokenSymbol}/>
    {/if}

    {#if swap}
        <label>Password
            <input bind:value={password}
                   type="password"/>
            <button type="button"
                    class="pure-button"
                    on:click={signSwap}>
                Sign and submit
            </button>
        </label>
    {/if}

    {#if error}
        <p class="error">
            {error}
        </p>
    {/if}
    {#if statusText}
        {statusText}
    {/if}
</p>

<OrderOverview {allTokens} />

<style>
    ul {
        list-style-type: none;
    }
</style>