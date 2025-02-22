<script lang="ts">
    import { Accordion, AccordionItem, Button, FloatingLabelInput, Toggle } from "flowbite-svelte";
</script>


<Accordion>
    <AccordionItem>
        <span slot="header">Band</span>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text" >Band Name</FloatingLabelInput>
    </AccordionItem>

    <AccordionItem>
        <span slot="header">Nextcloud Integration</span>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text">Host</FloatingLabelInput>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text">Username</FloatingLabelInput>
        <FloatingLabelInput style="outlined" id="floating_outlined" name="floating_outlined" type="text">Password</FloatingLabelInput>
    </AccordionItem>

    <AccordionItem>
        <span slot="header">YouTube Integration</span>
        <form action="?/yt" method="post" class="mt-8 space-y-6">
            <Toggle checked={true}>Use Invidious</Toggle>
            <FloatingLabelInput id="ytInvidiousServer" name="ytInvidiousServer" type="text">Invidious Server</FloatingLabelInput>
            <Button>Save</Button>
        </form>
    </AccordionItem>
</Accordion>
