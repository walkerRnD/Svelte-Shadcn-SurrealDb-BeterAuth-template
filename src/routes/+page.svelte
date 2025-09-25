<script lang="ts">
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
</script>

<Card class="max-w-lg">
  <CardHeader>
    <CardTitle>Welcome</CardTitle>
  </CardHeader>
  <CardContent>
    <p class="text-sm text-muted-foreground">
      Get started using the app. Use the buttons below to sign in or view your
      profile.
    </p>
  </CardContent>
  <CardFooter class="flex gap-2">
    <a href="/auth/login"><Button>Login</Button></a>
    <a href="/user/profile"><Button variant="secondary">Profile</Button></a>
  </CardFooter>
</Card>
