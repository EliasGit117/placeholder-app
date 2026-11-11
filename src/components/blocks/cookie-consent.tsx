"use client";

import { createContext, type FC, type PropsWithChildren, useCallback, useContext, useState } from 'react';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { IconCheck, IconCookie, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { m } from '@/paraglide/messages';

type ConsentChoice = 'accepted' | 'rejected';

const CONSENT_COOKIE_NAME = 'skinery-cookie-consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CookieConsentContext = createContext<(() => void) | null>(null);

interface CookieConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const parseConsent = (value: string | null | undefined): ConsentChoice | null =>
  value === 'accepted' || value === 'rejected' ? value : null;

// Runs on the server during SSR (request cookie) and in the browser (document.cookie),
// so the banner is part of the first HTML instead of popping in after hydration.
const readConsentCookie = createIsomorphicFn()
  .server((): ConsentChoice | null => parseConsent(getCookie(CONSENT_COOKIE_NAME)))
  .client((): ConsentChoice | null => {
    const prefix = `${CONSENT_COOKIE_NAME}=`;
    const value = document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length);

    return parseConsent(value);
  });

const writeConsentCookie = (choice: ConsentChoice) => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${choice}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
};

export const useCookieConsentSettings = () => {
  const openSettings = useContext(CookieConsentContext);

  if (!openSettings) {
    throw new Error('useCookieConsentSettings must be used within CookieConsentProvider');
  }

  return openSettings;
};

export const CookieConsent: FC<CookieConsentProps> = ({ isOpen, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96"
    >
      <Card className="rounded-b-none shadow-xl sm:rounded-xl">
        <CardHeader>
          <CardTitle id="cookie-consent-title" className="flex items-center gap-3">
            <IconCookie className="size-5 shrink-0 text-primary" aria-hidden="true" />
            {m['components.cookie_consent.title']()}
          </CardTitle>
          <CardDescription id="cookie-consent-description">
            {m['components.cookie_consent.description']()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {m['components.cookie_consent.essential']()}
          </p>
          <a href="/terms" className="text-xs text-primary underline underline-offset-4 hover:no-underline">
            {m['components.cookie_consent.learn_more']()}
          </a>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex sm:justify-end">
          <Button type="button" variant="outline" onClick={onReject}>
            <IconX data-icon="inline-start" aria-hidden="true" />
            {m['components.cookie_consent.decline']()}
          </Button>
          <Button type="button" onClick={onAccept}>
            <IconCheck data-icon="inline-start" aria-hidden="true" />
            {m['components.cookie_consent.accept']()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export const CookieConsentProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(() => readConsentCookie() === null);

  const saveChoice = useCallback((choice: ConsentChoice) => {
    writeConsentCookie(choice);
    setIsOpen(false);
  }, []);
  const accept = useCallback(() => saveChoice('accepted'), [saveChoice]);
  const reject = useCallback(() => saveChoice('rejected'), [saveChoice]);
  const openSettings = useCallback(() => setIsOpen(true), []);

  return (
    <CookieConsentContext.Provider value={openSettings}>
      {children}
      <CookieConsent isOpen={isOpen} onAccept={accept} onReject={reject} />
    </CookieConsentContext.Provider>
  );
};
