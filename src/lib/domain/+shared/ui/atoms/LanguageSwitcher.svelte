<script lang="ts">
  import { setLocale, getLocale } from "$lib/paraglide/runtime";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  const languages = [
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    { code: "es" as const, name: "Español", flag: "🇪🇸" },
    { code: "pt" as const, name: "Português (Brasil)", flag: "🇧🇷" },
  ];

  function handleLanguageChange(languageCode: "en" | "es" | "pt") {
    setLocale(languageCode);
  }

  const currentLocale = $derived(getLocale());
  const currentLanguage = $derived(
    languages.find((lang) => lang.code === currentLocale) || languages[0],
  );
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button variant="ghost" size="sm" {...props}>
        <span class="mr-2">{currentLanguage.flag}</span>
        <span class="hidden sm:inline">{currentLanguage.name}</span>
        <span class="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    {#each languages as language}
      <DropdownMenu.Item
        onclick={() => handleLanguageChange(language.code)}
        class={currentLocale === language.code ? "bg-accent" : ""}
      >
        <span class="mr-2">{language.flag}</span>
        {language.name}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
