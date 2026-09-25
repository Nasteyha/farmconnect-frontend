import { useInView } from './hooks/useInView'
import { useParallax } from './hooks/useParallax'
import { useScrollProgress } from './hooks/useScrollProgress'

function App() {
  const problem = useInView()
  const howItWorks = useInView()
  const features = useInView()
  const heroParallax = useParallax(15)
  const problemParallax = useParallax(15)
  const scrollProgress = useScrollProgress()

  return (
    <>
      <div
        className="fixed top-0 left-0 h-[3px] bg-marigold z-50"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <nav className="sticky top-0 z-40 backdrop-blur-md bg-sand/80 border-b border-forest/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-[family-name:--font-display] text-2xl font-semibold text-forest">FarmConnect</span>
          <div className="flex gap-3">
            <button className="px-5 py-2 text-forest font-[family-name:--font-body] rounded-full transition-colors hover:bg-forest/5">List Land</button>
            <button className="px-5 py-2 bg-forest text-sand rounded-full font-[family-name:--font-body] transition-colors hover:bg-forest/90">Find Land</button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden animate-hero">
        <div className="absolute -top-40 -right-20 w-[36rem] h-[36rem] rounded-full bg-marigold/40 blur-[100px] animate-blob -z-10" />
        <div className="absolute -bottom-40 -left-20 w-[32rem] h-[32rem] rounded-full bg-forest/30 blur-[100px] animate-blob -z-10" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center px-8 py-28">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-[family-name:--font-display] text-6xl font-semibold text-forest leading-[1.05]">
              Idle land.
              <br />
              <span className="bg-gradient-to-r from-forest via-marigold to-forest bg-clip-text text-transparent animate-shine">
                Growers with nowhere to plant.
              </span>
              <br />
              We close the gap.
            </h1>
            <p className="font-[family-name:--font-body] text-lg text-forest/80 max-w-md">
              Nairobi has land sitting unused while people who want to grow their own food have nowhere to do it. FarmConnect connects the two directly.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-forest text-sand rounded-full font-[family-name:--font-body] transition-colors hover:bg-forest/90">List your land</button>
              <button className="px-6 py-3 border border-forest text-forest rounded-full font-[family-name:--font-body] transition-colors hover:bg-forest hover:text-sand">Find land to grow</button>
            </div>
          </div>
          <div ref={heroParallax.ref} className="overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1705820274213-19b1d4c75b52?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Land ready to be cultivated near Nairobi"
              className="w-full h-[30rem] object-cover"
              style={{ transform: `translateY(${heroParallax.offset}px) scale(1.15)` }}
            />
          </div>
        </div>
      </section>

      <section className="bg-sand border-y border-forest/10">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 px-8 py-16">
          {[
            { n: '3', l: 'Pricing models' },
            { n: '2', l: 'SDGs supported' },
            { n: '1', l: 'Pilot county' },
            { n: '100%', l: 'Self-service' },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-start">
              <span className="font-[family-name:--font-display] text-4xl font-semibold text-marigold">{s.n}</span>
              <p className="font-[family-name:--font-body] text-sm text-forest/70 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={problem.ref} className={`relative bg-forest overflow-hidden transition-all duration-1000 ${problem.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] rounded-full bg-marigold/20 blur-[100px] animate-blob" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center px-8 py-28 relative">
          <div ref={problemParallax.ref} className="overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1735837836882-559fd3ab1a8e?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Unused urban land in Nairobi"
              className="w-full h-96 object-cover"
              style={{ transform: `translateY(${problemParallax.offset}px) scale(1.15)` }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-[family-name:--font-body] text-sm font-semibold tracking-widest uppercase text-marigold">The gap</span>
            <h2 className="font-[family-name:--font-display] text-4xl font-semibold text-sand leading-tight">
              The land is there. The people who want to grow are there. They just can't find each other.
            </h2>
            <p className="font-[family-name:--font-body] text-lg text-sand/80">
              Across Nairobi, land sits idle while residents with no space of their own want to grow food. There's no platform built for individual landowners and small-scale growers to connect directly — until now.
            </p>
          </div>
        </div>
      </section>

      <section ref={howItWorks.ref} className={`bg-sand transition-all duration-1000 ${howItWorks.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto px-8 py-28">
          <div className="text-center mb-16">
            <span className="font-[family-name:--font-body] text-sm font-semibold tracking-widest uppercase text-marigold">Process</span>
            <h2 className="font-[family-name:--font-display] text-4xl font-semibold text-forest mt-2">How it works</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { n: '01', t: 'List or browse', d: 'Landowners list available plots. Growers browse by location, size, and price.' },
              { n: '02', t: 'Connect and agree', d: 'Send a request, agree on terms, and the landowner confirms.' },
              { n: '03', t: 'Grow', d: 'Confirm access, and the lease period begins.' },
            ].map((s) => (
              <div key={s.n} className="p-8 rounded-2xl bg-white border border-forest/10 transition-all duration-300 hover:shadow-xl hover:shadow-forest/10 hover:-translate-y-1">
                <span className="font-[family-name:--font-display] text-5xl font-semibold text-marigold">{s.n}</span>
                <h3 className="font-[family-name:--font-body] font-semibold text-forest text-xl mt-4">{s.t}</h3>
                <p className="font-[family-name:--font-body] text-forest/80 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={features.ref} className={`bg-sand transition-all duration-1000 ${features.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto px-8 pb-28">
          <div className="mb-12">
            <span className="font-[family-name:--font-body] text-sm font-semibold tracking-widest uppercase text-marigold">Capabilities</span>
            <h2 className="font-[family-name:--font-display] text-4xl font-semibold text-forest mt-2">What FarmConnect does</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-10">
            {[
              { t: 'Map-based discovery', d: "Browse listings by location, size, and price, with a live map to see what's actually nearby." },
              { t: 'Flexible pricing', d: 'List land as fixed price, negotiable, or a share of the harvest, whichever fits.' },
              { t: 'AI-assisted crop suggestions', d: 'Each listing gets crop suggestions based on its location and weather, useful for growers and landowners alike.' },
              { t: 'Verified accountability', d: 'Identity checks and reviewed land documents give both sides a baseline of trust before committing.' },
            ].map((f) => (
              <div key={f.t} className="border-t border-forest/20 pt-4 transition-all duration-300 hover:border-marigold">
                <h3 className="font-[family-name:--font-body] font-semibold text-forest text-lg">{f.t}</h3>
                <p className="font-[family-name:--font-body] text-forest/80 text-base mt-1">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest">
        <div className="max-w-4xl mx-auto px-8 py-28 text-center">
          <h2 className="font-[family-name:--font-display] text-5xl font-semibold text-sand leading-tight">
            Got idle land?
            <br />
            <span className="text-marigold">Or the will to grow?</span>
          </h2>
          <div className="flex justify-center mt-10">
            <button className="px-8 py-4 bg-marigold text-forest rounded-full font-[family-name:--font-body] font-semibold transition-colors hover:bg-sand">Get started</button>
          </div>
        </div>
      </section>

      <footer className="bg-forest border-t border-sand/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-10">
          <span className="font-[family-name:--font-display] text-lg text-sand">FarmConnect</span>
          <p className="font-[family-name:--font-body] text-sand/80 text-sm">Supporting SDG 2 (Zero Hunger) and SDG 11 (Sustainable Cities)</p>
        </div>
      </footer>
    </>
  )
}

export default App