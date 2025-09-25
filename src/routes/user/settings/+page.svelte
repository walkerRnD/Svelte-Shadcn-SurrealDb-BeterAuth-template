<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  let displayName = '';
  function handleSave(event: SubmitEvent) {
    event.preventDefault();
    // TODO: save settings via API
    alert('Settings saved (demo)');
  }
</script>

<h1 class="text-xl font-semibold mb-4">Settings</h1>
<Card class="max-w-lg">
  <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
  <CardContent>
    <form onsubmit={handleSave} class="grid gap-3">
      <label class="grid gap-1">
        <span class="text-sm">Display name</span>
        <Input bind:value={displayName} />
      </label>
      <Button type="submit">Save</Button>
    </form>
  </CardContent>
</Card>

