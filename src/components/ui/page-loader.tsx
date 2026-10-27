export const PageLoader = ({ label = "Connecting you with top talent..." }: { label?: string }) => {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-6"
      role="status"
      aria-label={label}
    >
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 70.71% 70.71% at 50.00% 50.00%, rgba(0, 129, 255, 0.03) 0%, rgba(0, 129, 255, 0) 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Animated Spinner Ring */}
        <div className="pb-8">
          <div className="h-12 w-12 rounded-full border-[3px] border-[#0081FF] border-t-transparent animate-spin" />
        </div>

        {/* Brand & Subtitle */}
        <div className="flex flex-col items-center justify-start">
          <div className="pb-3">
            <div className="inline-flex items-center justify-start gap-2">
              <span className="font-sans text-4xl font-bold leading-[44px] text-[#191C1E]">
                GigClose
              </span>
              <div className="h-2 w-2 rounded-full bg-[#0081FF]" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="font-sans text-sm font-normal leading-5 tracking-[0.28px] text-[#777587]">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Preloader = PageLoader;
