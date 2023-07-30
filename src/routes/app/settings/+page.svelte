<script lang="ts">
    import { Accordion, AccordionItem, FloatingLabelInput } from "flowbite-svelte";
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
</Accordion>
