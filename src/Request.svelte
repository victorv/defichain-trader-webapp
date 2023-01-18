<script>
    export let request
</script>

{#if request}
    {#if request.error}
        <div class="message">
            <p class="error">{request.error}</p>
        </div>
    {:else if request.loading}
        <div class="message">
            <p class="info">Loading results...</p>
        </div>
    {/if}
{/if}

<style>
    div {
        display: flex;
        justify-content: center;
    }
</style>