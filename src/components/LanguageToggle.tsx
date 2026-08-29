import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <ToggleGroup
      aria-label="Select language / भाषा चुनें"
      variant="outline"
      size="sm"
      spacing={0}
      value={[lang]}
      // Base UI returns an array and allows deselecting the active item;
      // ignore the empty case so a language is always selected.
      onValueChange={(value) => {
        const next = value[0] as Lang | undefined;
        if (next) setLang(next);
      }}
    >
      <ToggleGroupItem value="en" aria-label="English">
        EN
      </ToggleGroupItem>
      <ToggleGroupItem value="hi" aria-label="हिन्दी">
        हिं
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
