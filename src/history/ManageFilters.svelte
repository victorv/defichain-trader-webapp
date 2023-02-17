<script>
    export let filter
    export let refresh

    const hasFilter = filter => {
        console.log(filter)
        if(!filter || !refresh) return false
        return filter.minBlock || filter.maxBlock
    }

    const removeBlockRange = () => refresh({minBlock: undefined, maxBlock: undefined})
</script>

{#if hasFilter(filter)}
    <p>
        {#if filter.minBlock && filter.maxBlock && filter.minBlock === filter.maxBlock}
            <button on:click={removeBlockRange}
                    class="pure-button"
                    type="button">
                block: {filter.minBlock}
                <strong>X</strong>
            </button>
        {:else if filter.minBlock && filter.maxBlock}
            <button on:click={removeBlockRange}
                    class="pure-button"
                    type="button">
                block: {filter.minBlock} - {filter.maxBlock}
                <strong>X</strong>
            </button>
        {:else if filter.minBlock}
            <button on:click={removeBlockRange}
                    class="pure-button"
                    type="button">
                block: {filter.minBlock} and above
                <strong>X</strong>
            </button>
        {:else if filter.maxBlock}
            <button on:click={removeBlockRange}
                    class="pure-button"
                    type="button">
                block: {filter.maxBlock} and below
                <strong>X</strong>
            </button>
        {/if}
    </p>
{/if}

<style>
    strong {
        color: red;
    }
</style>