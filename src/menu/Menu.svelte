<svelte:options immutable/>
<script>
    import DEX from "../dex/DEX.svelte";
    import Stats from "../stats/Stats.svelte";
    import TXHistory from "../history/TXHistory.svelte";
    import Mempool from "../mempool/Mempool.svelte";
    import QuickGraph from "../history/QuickGraph.svelte";
    import {screenStore} from "../store";
    import Icon from "../common/Icon.svelte";

    export let componentType
    export let onChange

    let open = false
    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

    const change = component => {
        open = false
        onChange(component)
    }
</script>

<div tabindex="0" id="menu">
    {#if screen.small}
        <span on:click={() => open = !open}>
            <Icon icon="menu"/>
        </span>
    {/if}
    <div class:pure-menu-horizontal={screen.large}
         class:pure-menu-vertical={screen.small}
         class:open
         class="pure-menu">
        <ul class="pure-menu-list">
            {#if screen.large}
                <li class="pure-menu-item logo">
                    <img src="logo.png" width="70" height="19"/>
                </li>
            {/if}

            <li class:pure-menu-selected={componentType === TXHistory}
                on:click={() => change(TXHistory)}
                class="pure-menu-item">
                <a href="#poolswaphistory" class="pure-menu-link">Explore</a>
            </li>

            <li class:pure-menu-selected={componentType === QuickGraph}
                on:click={() => change(QuickGraph)}
                class="pure-menu-item">
                <a href="#quick-graph" class="pure-menu-link">Quick Graph</a>
            </li>

            <li class:pure-menu-selected={componentType === Mempool}
                on:click={() => change(Mempool)}
                class="pure-menu-item">
                <a href="#mempool" class="pure-menu-link">Mempool</a>
            </li>

            <li class:pure-menu-selected={componentType === DEX}
                on:click={() => change(DEX)}
                class="pure-menu-item">
                <a href="#dex" class="pure-menu-link">Your Pool Swaps</a>
            </li>

            <li class:pure-menu-selected={componentType === Stats}
                on:click={() => change(Stats)}
                class="pure-menu-item">
                <a href="#bought_sold" class="pure-menu-link">Stats</a>
            </li>
            <li class="pure-menu-item">
                <a on:click={() => open = false} href="https://t.me/+gmg_XL0Nnpg3MjNk" target="_blank" class="pure-menu-link">
                    Telegram
                </a>
            </li>
        </ul>
    </div>
</div>

<style>
    .pure-menu-vertical {
        display: none;
        position: absolute;
        z-index: 1;
        background: white;
        width: 100%;
        border-bottom: 1px solid black;
        min-height: 100vh;
    }

    .pure-menu-vertical.open {
        display: block;
    }
</style>