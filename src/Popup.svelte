<script>
export let onClose
</script>

<div class="popup">
    <header>
        <button on:click={onClose} class="pure-button" type="button">Close</button>
        <slot name="header"></slot>
    </header>
    <div class="content">
        <slot name="content"></slot>
    </div>
</div>

<style>
    header {
        max-height: 50px;
    }

    .content {
        overflow-y: auto;
        max-height: calc(95vh - 50px);
    }

    .popup {
        position: fixed;
        z-index: 10000;
        background: white;
        border: 1px solid black;
        left: 2.5vw;
        top: 2.5vh;
        width: 95vw;
        height: 95vh;
    }
</style>