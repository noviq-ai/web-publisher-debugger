import { PixelLoader } from "@/components/assets/pixel-loader";
import { Shimmer } from "@/components/ui/text-shimmer";

export const ThinkingMessage: React.FC = () => {
  return (
    <div
      className="group/message w-full animate-in fade-in duration-300"
      data-role="assistant"
    >
      <div className="flex items-center justify-start gap-1.5">
        <div className="flex size-8 shrink-0 items-center justify-center">
          <PixelLoader size={24} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-1 p-0 text-sm">
            <Shimmer duration={1.5} spread={2}>
              Thinking...
            </Shimmer>
          </div>
        </div>
      </div>
    </div>
  );
};
