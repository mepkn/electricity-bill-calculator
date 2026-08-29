import { BillCalculator } from "@/components/BillCalculator";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

function Page() {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.appTitle}
          </h1>
          <div className="shrink-0 pt-0.5">
            <LanguageToggle />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t.appSubtitle}</p>
      </header>
      <BillCalculator />
    </main>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}

export default App;
