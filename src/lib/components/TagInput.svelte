<script lang="ts">
    
    import { writable } from "svelte/store";
    import { addTagStore } from "$lib/stores/store";

    export let getTags:() => Promise<void>;
    let newTag = "";
    let isValidTagInput = false;
    



    function checkValidity() {
        const regex = /^[A-Za-z ]{2,21}$/;
        isValidTagInput = regex.test(newTag);
    }

    async function createTag(){
        const res = await fetch('/api/tags', {
			method: 'POST',
			body: JSON.stringify({
				newTag
			})
		})

        addTagStore.set(false);
        newTag = "";

        getTags();
    }


</script>

<div class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-900">
    <div class="bg-black p-4 rounded shadow-lg">
        <input
            type="text"
            class="input input-bordered mb-2"
            placeholder="Tag Name"
            bind:value={newTag}
            on:input={checkValidity}
        />
        {#if isValidTagInput && newTag.length > 0}
            <button class="btn btn-primary" on:click={createTag}>Add</button>
        {:else}
            <p>Only letters and spaces can be used for a tag.</p>
        {/if}
    </div>
</div>
