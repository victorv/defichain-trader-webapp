<svelte:options immutable/>
<script>
    import DEX from "../dex/DEX.svelte";
    import {logout, store} from "../store";
    import Icon from "../common/Icon.svelte";
    import LogIn from "../account/LogIn.svelte";
    import TokenStats from "../dex/TokenStats.svelte";
    import TXHistory from "../history/TXHistory.svelte";
    import Mempool from "../mempool/Mempool.svelte";

    export let componentType
    export let onChange

    let account

    store.subscribe(state => account = state.account)
</script>

<div id="menu">
    <div class="pure-menu pure-menu-horizontal">
        <ul class="pure-menu-list">
            <li class="pure-menu-item logo">
                <img src="logo.png" width="70" height="19"/>
            </li>

            <li class:pure-menu-selected={componentType === TXHistory}
                on:click={() => onChange(TXHistory)}
                class="pure-menu-item">
                <a href="#poolswaphistory" class="pure-menu-link">Explore</a>
            </li>

            <li class:pure-menu-selected={componentType === DEX}
                on:click={() => onChange(DEX)}
                class="pure-menu-item">
                <a href="#dex" class="pure-menu-link">Track Poolswaps</a>
            </li>

            <li class:pure-menu-selected={componentType === Mempool}
                on:click={() => onChange(Mempool)}
                class="pure-menu-item">
                <a href="#mempool" class="pure-menu-link">Mempool</a>
            </li>

            <li class:pure-menu-selected={componentType === TokenStats}
                on:click={() => onChange(TokenStats)}
                class="pure-menu-item">
                <a href="#bought_sold" class="pure-menu-link">Bought/Sold</a>
            </li>
            {#if !account}
                <li class:pure-menu-selected={componentType === LogIn}
                    on:click={() => onChange(LogIn)}
                    class="pure-menu-item">
                    <a href="#login" class="pure-menu-link">
                        Log In
                    </a>
                </li>
            {:else}
                <li on:click={() => logout()}
                    class="pure-menu-item">
                    <a href="#logout" class="pure-menu-link">
                        Log Out
                    </a>
                </li>
            {/if}
            <li on:click={() => onChange(LogIn)}
                class="pure-menu-item">
                <a href="https://t.me/+gmg_XL0Nnpg3MjNk" target="_blank" class="pure-menu-link">
                    Telegram
                </a>
            </li>

        </ul>
    </div>
</div>