import { Suspense, useEffect, useState } from 'react';

import { getSettings, watchSettings } from '#api/storage/settingsStorage.js';
import ExtensionPage from '#pages/ExtensionPage.js';

export default function NewTabPage() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial setting
    void getSettings().then((settings) => {
      setIsEnabled(settings.useNewtabOverride);
    });

    // Watch for changes
    const unwatch = watchSettings((settings) => {
      setIsEnabled(settings.useNewtabOverride);
    });

    return unwatch;
  }, []);

  // Loading state
  if (isEnabled === null) {
    return null;
  }

  // If disabled, show minimal default new tab content
  if (!isEnabled) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center bg-background`}
      >
        <div className="text-center text-muted-foreground">
          <p>NullTab new tab page is disabled.</p>
          <p className="text-sm">
            Enable it in the extension settings to use NullTab here.
          </p>
        </div>
      </div>
    );
  }

  // Show the extension page
  return (
    <Suspense>
      <ExtensionPage />
    </Suspense>
  );
}
