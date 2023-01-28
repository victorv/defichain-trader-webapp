<script>
    import ProfitLoss from "./ProfitLoss.svelte";
    import Icon from "../common/Icon.svelte";
    import {getHeader, isWorseDefaultPath} from "./dex";

    export let poolSwap
    export let setBreakdown
    export let disabled
    export let breakdownIndex = 0

    const onSelect = index => {
        setBreakdown(index)
        breakdownIndex = index
    }
</script>

<header>
    <ul>
        {#each poolSwap.breakdown as breakdown, index}
            <li>
                <button class="pure-button"
                        title={getHeader(poolSwap, index)}
                        {disabled}
                        on:click={() => onSelect(index)}
                        class:info={index === breakdownIndex}>
                    {#if index === 0}
                        <Icon icon="best"/>
                    {:else if isWorseDefaultPath(poolSwap, breakdown)}
                        <Icon icon="danger"/>
                    {:else}
                        <Icon icon="warning"/>
                    {/if}
                    <ProfitLoss {poolSwap} estimate={breakdown.estimate}/>
                </button>
            </li>
        {/each}
    </ul>
</header>

<style>
    header {
        display: inline;
    }

    button.info {
        color: white;
    }

    ul {
        list-style-type: none;
        display: inline-flex;
        gap: 0.5rem;
        padding: 0;
        margin: 0;
    }
</style>