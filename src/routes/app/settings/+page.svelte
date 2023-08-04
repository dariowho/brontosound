<script lang="ts">
    import { Accordion, AccordionItem, Button, FloatingLabelInput, Toggle } from "flowbite-svelte";
</script>


<Accordion>
    <AccordionItem>
        <span slot="header">Band</span>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text" label="Band Name" />
    </AccordionItem>

    <AccordionItem>
        <span slot="header">Nextcloud Integration</span>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text" label="Host" />
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text" label="Username" />
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text" label="Password" />
    </AccordionItem>

    <AccordionItem>
        <span slot="header">YouTube Integration</span>
        <form action="?/yt" method="post" class="mt-8 space-y-6">
            <Toggle checked={true}>Use Invidious</Toggle>
            <FloatingLabelInput id="ytInvidiousServer" name="ytInvidiousServer" type="text" label="Invidious Server" />
            <Button>Save</Button>
        </form>
    </AccordionItem>
</Accordion>
