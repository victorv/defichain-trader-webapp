<script>
    export let number

    $: rounded = Math.round(number * 100 * 100) / 100
</script>

<span>
    <strong>-{rounded}%</strong>
</span>

<style>
    span {
        color: red;
    }
</style>