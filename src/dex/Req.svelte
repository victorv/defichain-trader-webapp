<script>
    export let value
    export let expect
</script>

<div class:info={value === expect} class:warning={value !== expect}>
    <strong>
        {#if value}Yes{:else}No{/if}
    </strong>
</div>