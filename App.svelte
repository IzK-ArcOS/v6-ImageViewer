<script lang="ts">
  import "./css/main.css";
  import { Runtime } from "./ts/runtime";

  export let runtime: Runtime;

  const { url } = runtime;
</script>

{#if $url}
  <img src={$url} alt="" />
{/if}
