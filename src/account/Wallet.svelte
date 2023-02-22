<script>
    import {onMount} from "svelte";
    import bigNumber, {createEncryptedWallet, CTransactionSegWit} from "../../public/lib/jellyfish";
    import LimitOrder from "./LimitOrder.svelte";
    import {getTokenID} from "../store";
    import BigNumber from "bignumber.js";

    export let allTokens

    const cryptoAndDUSD = ['DFI', 'DUSD', 'csETH', 'USDT', 'USDC', 'DOGE', 'BTC', 'BCH', 'LTC', 'ETH']

    let stock = allTokens.filter(token => !cryptoAndDUSD.includes(token))
    let balances = []
    let address
    let fromTokenSymbol
    let error
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
        try {
            const script = await walletAccount.getScript()
            const builder = walletAccount.withTransactionBuilder()

            const tx = await builder.dex.poolSwap(
                {
                    fromAmount: BigNumber(swap.quantity),
                    fromScript: script,
                    toScript: script,
                    fromTokenId: getTokenID(swap.tokenFrom),
                    toTokenId: getTokenID(swap.tokenTo),
                    maxPrice: BigNumber(swap.targetPrice)
                }, script
            )
            console.log(tx)

            const raw = new CTransactionSegWit(tx).toHex()
            console.log(raw)
            password = ''
            swap = null
        } catch (e) {
            error = 'invalid password'
            console.log(e)
        }
    }

    onMount(async () => {
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
    })
</script>

{#if address}
    {address}
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
        <button type="button" class="pure-button" on:click={signSwap}>
            Sign and submit
        </button>
    </label>
{/if}

{#if error}
    <p class="error">
        {error}
    </p>
{/if}

<style>
    ul {
        list-style-type: none;
    }
</style>