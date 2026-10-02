function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-140px)] items-center justify-center">
      <div className="w-full max-w-[780px] rounded-[32px] border border-slate-400/25 bg-slate-900/85 p-14 text-center shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6">
        <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Welcome to HireFlow</p>

        <h1 className="m-0 text-[clamp(42px,7vw,72px)] leading-[.95] tracking-[-.08em] text-white max-sm:text-[42px]">
          Find jobs. Hire talent. Grow faster.
        </h1>

        <p className="mx-auto mt-6 max-w-[620px] text-lg leading-[1.7] text-slate-400 max-sm:text-base">
          HireFlow connects employees and employers in one simple platform.
          Login or create an account to get started.
        </p>
      </div>
    </section>
  );
}

export default HomePage;