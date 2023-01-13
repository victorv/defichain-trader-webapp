<script>
    export let number
    export let inverse = false

    $: rounded = Math.round(number * 100000) / 100000
</script>

{#if inverse}
<span class:profit={number <= 0.0} class:loss={number > 0.0}>
    {#if number >= 0.0}+{/if}{rounded}%
</span>
{:else}
    <span class:profit={number >= 0.0} class:loss={number < 0.0}>
    {#if number >= 0.0}+{/if}{rounded}%
</span>
{/if}

<style>
    .profit {
        color: green;
    }

    .loss {
        color: red;
    }
</style>