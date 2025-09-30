<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { m } from "$lib/paraglide/messages.js";
</script>

<Card class="max-w-lg">
  <CardHeader>
    <CardTitle>{m.user_account_card_title()}</CardTitle>
  </CardHeader>
  <CardContent class="grid gap-3">
    <div class="text-sm text-muted-foreground">
      {m.user_account_description()}
    </div>
    <div class="flex flex-wrap gap-2">
      <a href="/user/account/change-password">
        <Button>{m.user_account_change_password()}</Button>
      </a>
      <a href="/user/account/delete-account">
        <Button variant="destructive">{m.user_account_delete_account()}</Button>
      </a>
    </div>
  </CardContent>
</Card>

