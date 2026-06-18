import { UploadPanel } from "@/components/UploadPanel";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20">
        <div className="max-w-xl text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            AI Full-Body Virtual Try-On
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            나만의 스타일을
            <br />
            <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              가상으로 입혀보세요
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            전신 사진을 업로드하고 카탈로그에서 옷을 고르면, AI가 내 사진
            위에 가상으로 입혀 줍니다. 슬라이더로 전·후를 비교해 보세요.
          </p>
        </div>

        <UploadPanel />
      </div>
    </main>
  );
}
