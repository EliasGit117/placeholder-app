import { createFileRoute } from '@tanstack/react-router';
import { IconBotanicalBranch } from '@/components/icons/botanical-branch';
import { IconBotanicalWaves } from '@/components/icons/botanical-waves';

export const Route = createFileRoute('/dev/icons')({
  component: IconsShowcase
});

function IconsShowcase() {
  return (
    <div className="min-h-svh bg-[#1C3A22] text-[#E8DFC8] p-10">
      <h1 className="font-heading text-3xl mb-10">Botanical accents</h1>

      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-center gap-3 border border-white/10 bg-white/[0.02] rounded-lg p-8 w-48">
          <IconBotanicalBranch className="size-32 text-[#C8A84B]"/>
          <span className="text-xs text-[#b0a98e]">Branch</span>
        </div>

        <div className="flex flex-col items-center gap-3 border border-white/10 bg-white/[0.02] rounded-lg p-8 w-48">
          <IconBotanicalWaves className="size-32 text-[#C8A84B]"/>
          <span className="text-xs text-[#b0a98e]">Waves</span>
        </div>
      </div>
    </div>
  );
}
