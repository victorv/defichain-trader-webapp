<script>
    import AddressFilter from "./AddressFilter.svelte";
    import DEX from "../dex/DEX.svelte";
    import Wallet from "./Wallet.svelte";

    export let allTokens
    export let Chart

    let componentType = location.hash.includes('wallet') ? Wallet : DEX

    const options = [
        {label: 'Addresses', component: AddressFilter, hash: 'addresses'},
        {label: 'Swaps', component: DEX, hash: 'swaps'},
        {label: 'Wallet', component: Wallet, hash: 'wallet'},
    ]

    const changeComponent = option => {
        componentType = option.component
        location.hash = `account/${option.hash}`
    }
</script>

<div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        {#each options as option}
            <li class:pure-menu-selected={componentType === option.component} class="pure-menu-item">
                <a on:click|preventDefault={() => changeComponent(option)}
                   href="#"
                   class="pure-menu-link">{option.label}</a>
            </li>
        {/each}
    </ul>
</div>

{#if componentType}
    <svelte:component {allTokens} {Chart} this={componentType}/>
{/if}