import { type ComponentProps, type FC, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UAParser } from 'ua-parser-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { IconDeviceDesktop, IconDeviceMobile, IconRefresh, IconX } from '@tabler/icons-react';
import { authClient } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

const MY_SESSIONS_KEY = ['settings', 'my-sessions'];

export const MySessionsCard: FC<ComponentProps<typeof Card>> = ({ className, ...props }) => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const confirm = useConfirm();

  const { data: sessions, isPending, isFetching, error, refetch } = useQuery({
    queryKey: MY_SESSIONS_KEY,
    queryFn: async () => {
      const result = await authClient.listSessions();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
  });

  useEffect(() => {
    if (!error) return;
    toast.error(m['common.error'](), { description: (error as Error).message });
  }, [error]);

  const { mutate: revokeOne, isPending: isRevoking } = useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.revokeSession({ token });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_SESSIONS_KEY });
      toast.success(m['pages.settings.security.revoke_success']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: (error as Error).message });
    },
  });

  const { mutate: revokeOthers, isPending: isRevokingAll } = useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_SESSIONS_KEY });
      toast.success(m['pages.settings.security.revoke_all_success']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: (error as Error).message });
    },
  });

  const handleRevokeAll = async () => {
    const confirmed = await confirm({
      title: m['pages.settings.security.revoke_all_confirm_title'](),
      description: m['pages.settings.security.revoke_all_confirm_description'](),
      confirmText: m['common.revoke'](),
      confirmButton: { variant: 'destructive' } as never,
    });
    if (confirmed) revokeOthers();
  };

  const isDisabled = isFetching || isRevoking || isRevokingAll;
  const otherSessions = sessions?.filter((s) => s.token !== session?.token) ?? [];

  return (
    <Card className={cn('w-full max-w-sm', className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>{m['pages.settings.security.sessions']()}</CardTitle>
          <CardDescription>{m['pages.settings.security.sessions_description']()}</CardDescription>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching}>
          <IconRefresh/>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-72 px-6">
          {isPending ? (
            <SessionsSkeleton/>
          ) : (
            sessions?.map((s, i) => {
              const isCurrent = s.token === session?.token;
              const ua = new UAParser(s.userAgent ?? '').getResult();
              const isMobile = ua.device.type === 'mobile';
              const deviceLabel = [ua.os.name, ua.browser.name].filter(Boolean).join(' · ');

              return (
                <div key={s.id}>
                  {i > 0 && <Separator className="my-1"/>}
                  <div className="flex items-center gap-3 py-2">
                    {isMobile
                      ? <IconDeviceMobile size={18} className="text-muted-foreground shrink-0"/>
                      : <IconDeviceDesktop size={18} className="text-muted-foreground shrink-0"/>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">
                          {deviceLabel || 'Unknown device'}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {m['pages.settings.security.current_session']()}
                          </Badge>
                        )}
                      </div>
                      {s.ipAddress && (
                        <p className="text-xs text-muted-foreground">{s.ipAddress}</p>
                      )}
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => revokeOne(s.token)}
                        disabled={isDisabled}
                      >
                        <IconX size={14}/>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </CardContent>
      {otherSessions.length > 1 && (
        <CardFooter className='sm:justify-end'>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-fit"
            onClick={handleRevokeAll}
            disabled={isDisabled}
          >
            {m['pages.settings.security.revoke_all_others']()}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const SessionsSkeleton: FC = () => (
  <div className="space-y-3">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 py-1">
        <Skeleton className="size-5 rounded"/>
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32"/>
          <Skeleton className="h-3 w-20"/>
        </div>
      </div>
    ))}
  </div>
);
