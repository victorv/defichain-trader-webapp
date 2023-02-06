<script>
    import {onMount} from "svelte";
    import TimePastSince from "../common/TimePastSince.svelte";

    export let refresh
    export let items

    let now = new Date().getTime()

    const isRemoved = result => result.amountA > 0 || result.amountB > 0

    onMount(async () => {
        location.hash = `#explore/PoolLiquidity`
        await refresh({})
    })
</script>

{#if items}
    <ul>
        {#each items as result}
            <li>
                <span class="gray">
                    {result.type}
                </span>
                <a class="limited" target="_blank" href="https://defiscan.live/transactions/{result.txID}">{result.txID}</a>
                <br/>
                <TimePastSince start={result.time * 1000} end={now}/>,
                <a target="_blank" href="https://defiscan.live/blocks/{result.blockHeight}">{result.blockHeight}</a>
                <br/>
                {Math.abs(result.amountA)}
                <strong>{result.tokenA}</strong>
                <span class="gray">&amp;</span>
                {Math.abs(result.amountB)}
                <strong>{result.tokenB}</strong>
                <br/>
                {result.shares} <span class="gray">shares</span>
                for <a target="_blank" class="limited" href="https://defiscan.live/address/{result.owner}">{result.owner}</a>
            </li>
        {/each}
    </ul>
{/if}

<style>
    .gray {
        color: gray;
        font-weight: bold;
    }

    ul {
        list-style-type: none;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    li {
        border-bottom: 1px solid black;
    }
</style>


