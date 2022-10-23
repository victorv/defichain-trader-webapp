<script>
    export let text

    const limitLength = s => {
        if (!s || !s.length) return ''
        if (s.length <= 8) return s
        return `${s.substring(0, 6)}`
    }

    $: limited = text ? limitLength(text) : ''
</script>

{#if limited}
    <span>{limited}{#if limited.length === 6}..{/if}</span>
{/if}

<style>
    span {
        font-family: monospace, monospace;
    }
</style>

