<script>
    export let number

    $: rounded = Math.round(number * 100000) / 100000
</script>

<span class:profit={number >= 0.0} class:loss={number < 0.0}>
    {#if number >= 0.0}+{/if}{rounded}%
</span>

<style>
    .profit {
        color: green;
    }

    .loss {
        color: red;
    }
</style>