# Authentication Guard Components

This directory contains reusable guard components that handle authentication and authorization logic with proper loading states and fallbacks.

## UserGuard.svelte

Protects content that requires user authentication. Shows loading spinner while session loads, auth form if not authenticated, or protected content if authenticated.

### Usage

```svelte
<script lang="ts">
  import UserGuard from "$lib/domain/+shared/ui/guards/UserGuard.svelte";
</script>

<UserGuard>
  {#snippet children()}
    <h1>Protected User Content</h1>
    <p>This content is only visible to authenticated users.</p>
  {/snippet}
</UserGuard>
```

### With custom fallback

```svelte
<UserGuard>
  {#snippet children()}
    <h1>Protected Content</h1>
  {/snippet}
  
  {#snippet fallback()}
    <div class="text-center">
      <h2>Please sign in</h2>
      <p>Custom message for unauthenticated users</p>
    </div>
  {/snippet}
</UserGuard>
```

### Props

- `children: Snippet<[]>` - Content to show when user is authenticated
- `fallback?: Snippet<[]>` - Custom content to show when not authenticated (optional, defaults to LoginPage)
- `loadingMessage?: string` - Custom loading message (optional, defaults to i18n loading message)

## AdminGuard.svelte

Protects content that requires admin privileges. Shows loading spinner while session loads, auth form if not authenticated, "Access Denied" if not authorized, or protected content if admin.

### Usage

```svelte
<script lang="ts">
  import AdminGuard from "$lib/domain/+shared/ui/guards/AdminGuard.svelte";
</script>

<AdminGuard adminEmails={["admin@example.com", "owner@company.com"]}>
  {#snippet children()}
    <h1>Admin Dashboard</h1>
    <p>This content is only visible to administrators.</p>
  {/snippet}
</AdminGuard>
```

### With custom admin check

```svelte
<AdminGuard checkAdminRole={(user) => user?.role === 'admin' || user?.permissions?.includes('admin')}>
  {#snippet children()}
    <h1>Admin Panel</h1>
  {/snippet}
</AdminGuard>
```

### Props

- `children: Snippet<[]>` - Content to show when user is authenticated and authorized
- `fallback?: Snippet<[]>` - Custom content to show when not authenticated (optional, defaults to LoginPage)
- `loadingMessage?: string` - Custom loading message (optional, defaults to i18n loading message)
- `adminEmails?: string[]` - List of admin email addresses (optional)
- `checkAdminRole?: (user: any) => boolean` - Custom function to check if user is admin (optional)

## States Handled

Both guards handle these states automatically:

1. **Loading** (`$session.data === undefined`): Shows spinner with loading message
2. **Not Authenticated** (`!$session.data?.user`): Shows LoginPage or custom fallback
3. **Not Authorized** (AdminGuard only): Shows "Access Denied" card with redirect to profile
4. **Authorized**: Renders the protected content

## Integration with Better Auth

The guards use the `useSession()` hook from the Better Auth Svelte client, which automatically:
- Tracks session state reactively
- Handles session updates after login/logout
- Provides type-safe user data

## Accessibility

- Loading states include proper ARIA labels
- Error states use semantic HTML
- Keyboard navigation is preserved
- Screen reader friendly messages

## Example: Protecting a Route

Instead of using `+layout.server.ts` guards, you can use these components directly in pages:

```svelte
<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
  import AdminGuard from "$lib/domain/+shared/ui/guards/AdminGuard.svelte";
</script>

<AdminGuard adminEmails={["admin@company.com"]}>
  {#snippet children()}
    <!-- Your admin page content -->
  {/snippet}
</AdminGuard>
```

This approach provides better UX with loading states and inline authentication forms instead of redirects.
