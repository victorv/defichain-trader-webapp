<script>
    import DesktopNotifications from "./DesktopNotifications.svelte";
</script>

<form class="pure-form pure-form-stacked">
    <fieldset>
        <legend>Settings</legend>
        <DesktopNotifications/>
    </fieldset>
</form>

<p>
    Version: {window.commitHash}
</p>

<style>
    form {
        padding-left: 0.5rem;
    }
</style>