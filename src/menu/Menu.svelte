<svelte:options immutable/>
<script>
    import TXHistory from "../history/TXHistory.svelte";
    import QuickGraph from "../history/QuickGraph.svelte";
    import {screenStore} from "../store";
    import Icon from "../common/Icon.svelte";
    import Account from "../account/Account.svelte";
    import StatusPage from "./StatusPage.svelte";
    import MixedMempool from "../mempool/MixedMempool.svelte";
    import Stats from "../stats/Stats.svelte";

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

            <li class:pure-menu-selected={componentType === MixedMempool}
                on:click={() => change(MixedMempool)}
                class="pure-menu-item">
                <a href="#mempool" class="pure-menu-link">Mempool</a>
            </li>
            <li class:pure-menu-selected={componentType === Account}
                class="pure-menu-item">
                <a on:click={() => change(Account)}
                   href="#account"
                   class="pure-menu-link">
                    Account
                </a>
            </li>
            <li class:pure-menu-selected={componentType === Stats}
                class="pure-menu-item">
                <a on:click={() => change(Stats)}
                   href="#stats"
                   class="pure-menu-link">
                    Stats
                </a>
            </li>
            <li class:pure-menu-selected={componentType === StatusPage}
                class="pure-menu-item"
                on:click={() => change(StatusPage)}>
                <a href="#about"
                   class="pure-menu-link">
                    About
                </a>
            </li>
        </ul>
    </div>
</div>

<style>
    .pure-menu-vertical {
        display: none;
        position: absolute;
        z-index: 10;
        background: white;
        width: 100%;
        border-bottom: 1px solid black;
        min-height: 100vh;
    }

    .pure-menu-vertical.open {
        display: block;
    }
</style>