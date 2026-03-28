function PageHero({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-slate-900 pt-30 pb-16 md:pt-30 md:pb-10 mb-7 md:mb-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_45%,#38bdf8_100%)] opacity-95" />
        <div className="absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute left-10 top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/10 px-6 py-4 text-center shadow-2xl backdrop-blur-md md:px-10 md:py-3">

          <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-5 text-base leading-8 text-white/85 md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default PageHero