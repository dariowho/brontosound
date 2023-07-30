<script>
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, Badge} from 'flowbite-svelte';
    export let data;
</script>

<Table hoverable={true}>
    <TableHead>
      <TableHeadCell class="!p-4">
        <Checkbox />
      </TableHeadCell>
      <TableHeadCell>Song Name</TableHeadCell>
      <TableHeadCell>Author</TableHeadCell>
      <TableHeadCell>Added</TableHeadCell>
      <TableHeadCell>Tags</TableHeadCell>
      <TableHeadCell>
        <span class="sr-only"> Edit </span>
      </TableHeadCell>
    </TableHead>
    <TableBody>

      {#each data.songs as song}
        <TableBodyRow>
          <TableBodyCell class="!p-4">
            <Checkbox />
          </TableBodyCell>
          <TableBodyCell>{song.title}</TableBodyCell>
          <TableBodyCell>{song.author}</TableBodyCell>
          <TableBodyCell>{song.creationDate.toLocaleDateString('it-IT')}</TableBodyCell>
          <TableBodyCell>
            {#each song.tags as songTag}
              <Badge>{songTag}</Badge> 
            {/each}
          </TableBodyCell>
          <TableBodyCell>
            <a href="/tables" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
              Edit
            </a>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>