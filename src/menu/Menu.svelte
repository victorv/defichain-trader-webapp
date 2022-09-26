<svelte:options immutable/>
<script>
    import DEX from "../dex/DEX.svelte";
    import PoolSwapHistory from "../history/PoolSwapHistory.svelte";
    import Settings from "../settings/Settings.svelte";
    import {logout, store, updateStore} from "../store";
    import Icon from "../common/Icon.svelte";
    import LogIn from "../account/LogIn.svelte";
    import TokenStats from "../dex/TokenStats.svelte";

    export let componentType
    export let onChange
    export let isMenuActive

    let account

    store.subscribe(state => account = state.account)

    const toggleMenu = () => updateStore({isMenuActive: !isMenuActive})
</script>


<!-- Menu toggle -->
<a on:click={toggleMenu} href="#menu" id="menuLink" class="menu-link">
    <!-- Hamburger icon -->
    <span></span>
</a>

<div id="menu">
    <div class="pure-menu">
        <ul class="pure-menu-list">
            <li class="pure-menu-item logo">
                <img src="logo.png" width="140" height="38"/>
            </li>

            <li class:pure-menu-selected={componentType === PoolSwapHistory}
                on:click={() => onChange(PoolSwapHistory)}
                class="pure-menu-item">
                <a href="#poolswaphistory" class="pure-menu-link">Pool Swaps</a>
            </li>


            <li class:pure-menu-selected={componentType === DEX}
                on:click={() => onChange(DEX)}
                class="pure-menu-item">
                <a href="#dex" class="pure-menu-link">Track Pool Swaps</a>
            </li>

            <li class:pure-menu-selected={componentType === TokenStats}
                on:click={() => onChange(TokenStats)}
                class="pure-menu-item">
                <a href="#tokenstatistics" class="pure-menu-link">Token Statistics</a>
            </li>

            <li class:pure-menu-selected={componentType === Settings}
                on:click={() => onChange(Settings)}
                class="pure-menu-item menu-item-divided">
                <a href="#settings" class="pure-menu-link">Settings</a>
            </li>
            {#if !account}
                <li class:pure-menu-selected={componentType === LogIn}
                    on:click={() => onChange(LogIn)}
                    class="pure-menu-item menu-item-divided">
                    <a href="#login" class="pure-menu-link">
                        Log In
                    </a>
                </li>
            {:else}
                <li on:click={() => logout()}
                    class="pure-menu-item menu-item-divided">
                    <a href="#logout" class="pure-menu-link">
                        Log Out
                    </a>
                </li>
            {/if}
            <li on:click={() => onChange(LogIn)}
                class="pure-menu-item menu-item-divided">
                <a href="https://t.me/+gmg_XL0Nnpg3MjNk" target="_blank" class="pure-menu-link">
                    Discuss <Icon icon="telegram"/>
                </a>
            </li>

        </ul>
    </div>
</div>

<style>
    .logo {
        display: flex;
        justify-content: center;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
    /*
    The `#menu` `<div>` is the parent `<div>` that contains the `.pure-menu` that
    appears on the left side of the page.
    */

    #menu {
        margin-left: -150px; /* "#menu" width */
        width: 150px;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1000; /* so the menu or its navicon stays above all content */
        background: #191818;
        overflow-y: auto;
    }

    /*
    All anchors inside the menu should be styled like this.
    */
    #menu a {
        color: #999;
        border: none;
        padding: 0.6em 0 0.6em 0.6em;
    }

    /*
    Remove all background/borders, since we are applying them to #menu.
    */
    #menu .pure-menu,
    #menu .pure-menu ul {
        border: none;
        background: transparent;
    }

    /*
    Add that light border to separate items into groups.
    */
    #menu .pure-menu ul,
    #menu .pure-menu .menu-item-divided {
        border-top: 1px solid #333;
    }

    /*
    Change color of the anchor links on hover/focus.
    */
    #menu .pure-menu li a:hover,
    #menu .pure-menu li a:focus {
        background: #333;
    }

    /*
    This styles the selected menu item `<li>`.
    */
    #menu .pure-menu-selected {
        background: #1f8dd6;
    }

    /*
    This styles a link within a selected menu item `<li>`.
    */
    #menu .pure-menu-selected a {
        color: #fff;
    }

    /* -- Dynamic Button For Responsive Menu -------------------------------------*/

    /*
    The button to open/close the Menu is custom-made and not part of Pure. Here's
    how it works:
    */

    /*
    `.menu-link` represents the responsive menu toggle that shows/hides on
    small screens.
    */
    .menu-link {
        position: fixed;
        display: block; /* show this only on small screens */
        top: 0;
        left: 0; /* "#menu width" */
        background: #000;
        background: rgba(0, 0, 0, 0.7);
        font-size: 10px; /* change this value to increase/decrease button size */
        z-index: 10;
        width: 2em;
        height: auto;
        padding: 2.1em 1.6em;
    }

    .menu-link:hover,
    .menu-link:focus {
        background: #000;
    }

    .menu-link span {
        position: relative;
        display: block;
    }

    .menu-link span,
    .menu-link span:before,
    .menu-link span:after {
        background-color: #fff;
        pointer-events: none;
        width: 100%;
        height: 0.2em;
    }

    .menu-link span:before,
    .menu-link span:after {
        position: absolute;
        margin-top: -0.6em;
        content: " ";
    }

    .menu-link span:after {
        margin-top: 0.6em;
    }
</style>