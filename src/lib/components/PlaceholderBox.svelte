<script lang="ts">
    export let height: string = "200px";
</script>

<div class="placeholderBox" style="height: {height}">
    <slot></slot>
</div>

<style>
    .placeholderBox {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 3px dashed lightgray;
        padding:1rem;
    }
</style>