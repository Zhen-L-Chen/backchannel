"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ARCHIVE,
  CURRENT_EPISODE,
  TICKER_ITEMS,
  WALL,
  makeAlias,
  type CampKey,
  type Episode,
  type WallQuote,
} from "@/lib/club";

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

interface Saved {
  alias?: string;
  votes: Record<string, CampKey>;
  seats: Record<string, boolean>;
  resonated: string[];
  takes: { epId: string; text: string; camp: CampKey }[];
}

const KEY = "backchannel:v1";
const EMPTY: Saved = { votes: {}, seats: {}, resonated: [], takes: [] };

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — the club forgives */
  }
}

/* ------------------------------------------------------------------ */
/* bits                                                                */
/* ------------------------------------------------------------------ */

function Starburst() {
  const n = 16;
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 50 : 39;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
  }
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={pts.join(" ")} fill="var(--red)" stroke="var(--ink)" strokeWidth="2.5" />
    </svg>
  );
}

function Ticker({ items }: { items: string[] }) {
  const row = items.map((t, i) => (
    <span className="ticker__item" key={i}>
      {t}
    </span>
  ));
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row}
        {row}
      </div>
    </div>
  );
}

function useCountdown(iso: string) {
  const [left, setLeft] = useState<string | null>(null);
  useEffect(() => {
    const target = new Date(iso).getTime();
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      const d = Math.floor(ms / 86_400_000);
      const h = Math.floor(ms / 3_600_000) % 24;
      const m = Math.floor(ms / 60_000) % 60;
      const s = Math.floor(ms / 1000) % 60;
      setLeft(`${d}d ${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return left;
}

/* ------------------------------------------------------------------ */
/* the page                                                            */
/* ------------------------------------------------------------------ */

export default function ClubPage({ episode = CURRENT_EPISODE }: { episode?: Episode }) {
  const ep = episode;
  const theme = ep.theme ?? "broadsheet";
  const isGloss = theme === "gloss";

  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [counts, setCounts] = useState<Record<CampKey, number>>({
    a: ep.camps.a.votes,
    b: ep.camps.b.votes,
  });
  const [wall, setWall] = useState<WallQuote[]>(ep.wall ?? WALL);
  const [takeDraft, setTakeDraft] = useState("");
  const [takeFiled, setTakeFiled] = useState(false);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);
  const ballotRef = useRef<HTMLDivElement>(null);

  const vote = saved.votes[ep.id];
  const reserved = !!saved.seats[ep.id];
  const countdown = useCountdown(ep.closesAt);

  /* hydrate from localStorage */
  useEffect(() => {
    const s = load();
    setSaved(s);
    setHydrated(true);
    if (s.votes[ep.id]) {
      setCounts((c) => ({ ...c, [s.votes[ep.id]]: c[s.votes[ep.id]] + 1 }));
    }
    const mine = s.takes.filter((t) => t.epId === ep.id);
    if (mine.length > 0 && s.alias) {
      setTakeFiled(true);
      setWall((w) => [
        ...mine.map((t, i) => ({
          id: `mine-${i}`,
          text: t.text,
          alias: s.alias!,
          camp: t.camp,
          resonates: 1,
          yours: true,
        })),
        ...w,
      ]);
    }
  }, [ep.id]);

  /* gentle drift so the room feels alive */
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.55) {
        const side: CampKey = Math.random() < 0.58 ? "a" : "b";
        setCounts((c) => ({ ...c, [side]: c[side] + 1 }));
      }
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const total = counts.a + counts.b;
  const pctA = Math.round((counts.a / total) * 100);
  const pctB = 100 - pctA;
  const myPct = vote === "a" ? pctA : pctB;
  const minority = vote && myPct < 50;

  const persist = useCallback((next: Saved) => {
    setSaved(next);
    save(next);
  }, []);

  const castVote = (side: CampKey) => {
    if (vote) return;
    const next: Saved = {
      ...saved,
      alias: saved.alias ?? makeAlias(ep.aliasFlavor),
      votes: { ...saved.votes, [ep.id]: side },
    };
    persist(next);
    setCounts((c) => ({ ...c, [side]: c[side] + 1 }));
    setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const fileTake = (e: React.FormEvent) => {
    e.preventDefault();
    const text = takeDraft.trim();
    if (!text || !vote || !saved.alias) return;
    persist({ ...saved, takes: [...saved.takes, { epId: ep.id, text, camp: vote }] });
    setWall((w) => [
      { id: `mine-${Date.now()}`, text, alias: saved.alias!, camp: vote, resonates: 1, yours: true },
      ...w,
    ]);
    setTakeDraft("");
    setTakeFiled(true);
  };

  const claimSeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr(true);
      return;
    }
    setEmailErr(false);
    persist({ ...saved, seats: { ...saved.seats, [ep.id]: true } });
  };

  const toggleResonate = (id: string) => {
    const on = saved.resonated.includes(id);
    persist({
      ...saved,
      resonated: on ? saved.resonated.filter((x) => x !== id) : [...saved.resonated, id],
    });
    setWall((w) =>
      w.map((q) => (q.id === id ? { ...q, resonates: q.resonates + (on ? -1 : 1) } : q)),
    );
  };

  const seatsLeft = useMemo(() => {
    const left: Record<CampKey, number> = {
      a: ep.camps.a.seatsTotal - ep.camps.a.seatsClaimed,
      b: ep.camps.b.seatsTotal - ep.camps.b.seatsClaimed,
    };
    if (reserved && vote) left[vote] = Math.max(0, left[vote] - 1);
    return left;
  }, [ep, reserved, vote]);

  const campWord = (k: CampKey) => ep.camps[k].name;

  return (
    <div className={`shell theme-${theme}`}>
      <div className="grain" aria-hidden="true" />
      {isGloss && (
        <div className="blobs" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      <Ticker items={ep.ticker ?? TICKER_ITEMS} />

      {/* ---------------- masthead ---------------- */}
      <header className="masthead sheet">
        <div className="masthead__dateline">
          <span>{ep.volume ?? "Vol. I"} · No. {ep.number}</span>
          <span>{ep.dateline ?? `Season One · Week ${ep.number} of 4`}</span>
          <span>Price: one opinion</span>
        </div>
        <h1 className="masthead__title misreg">The Backchannel</h1>
        <p className="masthead__sub">
          a conversational club · <em>we don’t do surveys. we host arguments.</em>
        </p>
        <div className="masthead__rules" />
        <div className="epbar">
          <span>
            Conversation <b>Nº {String(ep.number).padStart(3, "0")}</b>
          </span>
          <span className="epbar__live">
            <span className="epbar__dot" /> now taking sides
          </span>
          <span>
            ballot closes Fri 6 p.m. · <b>{countdown ?? "……"}</b>
          </span>
        </div>
      </header>

      <main className="sheet">
        {/* ---------------- the take ---------------- */}
        <section className="take" ref={ballotRef}>
          {isGloss && (
            <>
              <span className="sticker sticker--tl">gloss edition 💋</span>
              <span className="sticker sticker--br">3 seconds ✦ go</span>
            </>
          )}
          <div className="kicker">{ep.kicker}</div>
          <h2 className="take__hook misreg">“{ep.hook}”</h2>
          <p className="take__gut">
            gut reaction · <b>first instinct</b> · three seconds · no thinking
          </p>
        </section>

        {/* ---------------- the ballot ---------------- */}
        <section className="ballot" aria-label="Take a side">
          {(["a", "b"] as const).map((k) => (
            <span key={k} style={{ display: "contents" }}>
              {k === "b" && (
                <div className="vs">
                  <Starburst />
                  <span>VS</span>
                </div>
              )}
              <button
                className={`camp camp--${ep.camps[k].color} ${vote && vote !== k ? "camp--dim" : ""}`}
                onClick={() => castVote(k)}
                disabled={!!vote}
              >
                <span className="camp__label">Camp {k === "a" ? "A" : "B"}</span>
                <span className="camp__name">{ep.camps[k].name}</span>
                <span className="camp__hint">
                  {vote === k
                    ? "your side. filed."
                    : vote
                      ? "the road not taken"
                      : `tap to side with ${counts[k]} others`}
                </span>
                {vote === k && <span className="camp__yours stamp stamp--in">your camp</span>}
              </button>
            </span>
          ))}
        </section>

        {/* ---------------- the reveal ---------------- */}
        {vote && (
          <section className="reveal" ref={revealRef} id="reveal">
            <div className="reveal__head">
              <span className="stamp stamp--big stamp--in">
                {isGloss ? "locked in ✦" : "ballot filed"}
              </span>
              <p className="reveal__verdict">
                You stand with the {myPct}%.{" "}
                {minority ? "The room disagrees, for now." : "The room leans your way, for now."}
              </p>
            </div>

            <div className="split" role="img" aria-label={`${pctA}% versus ${pctB}%`}>
              <div className="split__seg split__seg--red" style={{ width: `${pctA}%` }}>
                <span className="split__pct">{pctA}%</span>
              </div>
              <div className="split__seg split__seg--blue" style={{ width: `${pctB}%` }}>
                <span className="split__pct">{pctB}%</span>
              </div>
            </div>
            <div className="split__legend">
              <span>
                <b className="red">■ {campWord("a")}</b> · {counts.a} voices
              </span>
              <span>
                <b className="blue">{campWord("b")} ■</b> · {counts.b} voices
              </span>
            </div>

            <div className="alias">
              <div>
                <span className="alias__label">for the record, you’ll be known as</span>
                <div className="alias__name">{saved.alias}</div>
              </div>
              <span className="stamp">anonymous</span>
            </div>

            <div className="takebox">
              <label className="takebox__label" htmlFor="take">
                your one-line take · the moderator may carry it into other booths, unsigned
              </label>
              {takeFiled ? (
                <p className="type" style={{ fontSize: 14 }}>
                  Filed. Your words are in circulation. Watch the wall below.
                </p>
              ) : (
                <form className="takebox__row" onSubmit={fileTake}>
                  <input
                    id="take"
                    value={takeDraft}
                    onChange={(e) => setTakeDraft(e.target.value)}
                    placeholder="type it like you'd say it out loud…"
                    maxLength={140}
                  />
                  <button className="btn" type="submit">
                    Post to the wall
                  </button>
                </form>
              )}
            </div>

            <div className="reveal__cta">
              <button
                className="btn btn--red btn--loud"
                onClick={() =>
                  document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {reserved
                  ? "Seat reserved · see your ticket ↓"
                  : `Now claim your seat · ${seatsLeft[vote]} left in your camp ↓`}
              </button>
            </div>
          </section>
        )}

        {/* ---------------- the seat ---------------- */}
        <section className="section" id="claim">
          <div className="section__head">
            <div className="kicker">the conversation · tue to thu · one-to-one · 20 min</div>
            <h2 className="section__title misreg">Claim your seat in the booth</h2>
          </div>

          <div className="ticket">
            <div className="ticket__body">
              <div className="ticket__title">“{ep.hook}”</div>
              <div className="ticket__meta">
                <span>
                  format: <b>a private argument with the moderator.</b> no group call, no audience.
                </span>
                <span>
                  seats: <b>12 per camp.</b>{" "}
                  <span className="red">
                    {vote
                      ? `${seatsLeft[vote]} left in camp ${campWord(vote).toLowerCase()}`
                      : `${seatsLeft.a} left in camp a · ${seatsLeft.b} in camp b`}
                  </span>
                </span>
                <span>
                  the reveal: <b>Friday 6 p.m.</b> participants only.
                </span>
              </div>

              {reserved ? (
                <div className="ticket__reserved">
                  <span className="stamp stamp--big stamp--in">reserved</span>
                  <p>
                    Your invitation arrives <b>Tuesday, 9 a.m.</b> It carries a one-time door
                    token. Once you enter the booth, the ledger forgets it was ever yours.
                  </p>
                </div>
              ) : (
                <>
                  <form className="seatform" onSubmit={claimSeat}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      aria-label="Email for your invitation"
                      style={emailErr ? { borderColor: "var(--red)" } : undefined}
                    />
                    <button className="btn btn--red" type="submit">
                      Book my seat
                    </button>
                  </form>
                  <p className="ticket__fine">
                    {emailErr
                      ? "That address won't reach the doorman. Check it once more."
                      : vote
                        ? "your email books the seat. it never enters the booth."
                        : "your email books the seat, it never enters the booth. tip: take a side above, seats are per camp."}
                  </p>
                </>
              )}
            </div>

            <div className="ticket__stub">
              <span className="ticket__admit">admit one · admit one</span>
              <div className="ticket__stub-inner">
                <span className="ticket__no">Nº {String(ep.number).padStart(3, "0")}</span>
                <div className="barcode" />
                <span className="type" style={{ fontSize: 10.5, letterSpacing: "0.2em" }}>
                  {hydrated && saved.alias ? saved.alias.toUpperCase() : "UNNAMED GUEST"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <hr className="cut" />

        {/* ---------------- the wall ---------------- */}
        <section className="section">
          <div className="section__head">
            <div className="kicker">overheard in the booths · unsigned by design</div>
            <h2 className="section__title misreg">The wall</h2>
          </div>
          <div className="wall">
            {wall.map((q) => (
              <article className={`wall__card ${q.yours ? "wall__card--yours" : ""}`} key={q.id}>
                <p className="wall__quote">{q.text}</p>
                <div className="wall__row">
                  <span className="wall__attrib">
                    {q.alias}
                    {q.yours ? " (you)" : ""} ·{" "}
                    <span className={ep.camps[q.camp].color === "red" ? "red" : "blue"}>
                      camp {campWord(q.camp).toLowerCase()}
                    </span>
                  </span>
                  <button
                    className={`resonate ${saved.resonated.includes(q.id) ? "resonate--on" : ""}`}
                    onClick={() => toggleResonate(q.id)}
                  >
                    {isGloss ? "💅 felt that" : "◉ resonates"} · {q.resonates}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ---------------- classified ---------------- */}
      <section className="classified">
        <div className="sheet section">
          <div className="kicker">classified: how the mask works</div>
          <p className="classified__slogan">
            We know who’s in the club. We <em>never</em> know who said what.
          </p>
          <div className="steps">
            <div className="step">
              <span className="step__no">01</span>
              <h3 className="step__title">The ledger</h3>
              <p>
                Your email lives in the clubhouse ledger. It books seats and delivers invitations.
                That is its entire job.
              </p>
            </div>
            <div className="step">
              <span className="step__no">02</span>
              <h3 className="step__title">The token</h3>
              <p>
                Your invitation carries a one-time door token. The moment you enter the booth, the
                link between token and email is burned.
              </p>
            </div>
            <div className="step">
              <span className="step__no">03</span>
              <h3 className="step__title">The booth</h3>
              <p>
                Inside, you are only your pseudonym. Transcripts belong to a stranger we can’t
                trace, which is why people say the true thing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- the season ---------------- */}
      <main className="sheet">
        <section className="section">
          <div className="section__head">
            <div className="kicker">season one: four arguments, one room</div>
            <h2 className="section__title misreg">The season so far</h2>
          </div>
          <div className="archive">
            {ARCHIVE.map((e) => (
              <article className={`arch ${e.status === "sealed" ? "arch--sealed" : ""}`} key={e.id}>
                <span className="arch__no">Nº {String(e.number).padStart(3, "0")}</span>
                <p className="arch__hook">
                  {e.status === "sealed" ? "……… ……… ………" : `“${e.hook}”`}
                </p>
                {e.status === "revealed" && e.reveal ? (
                  <span className="arch__moved">
                    revealed · room moved <b>{e.reveal.movedPts} pts</b>
                    <br />
                    toward “{e.reveal.movedToward}”
                  </span>
                ) : (
                  <span className="stamp">sealed until Mon</span>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- footer ---------------- */}
        <footer className="footer">
          <p className="footer__motto misreg">
            Alone in the booth.
            <br />
            Together in the room.
          </p>
          <p className="footer__fine">
            the backchannel is a conversational club by paperminds · no surveys were harmed
          </p>
          <div className="footer__page">page one · the backchannel · est. 2026 · printed nowhere</div>
        </footer>
      </main>

      {/* ---------------- sticky cta ---------------- */}
      <div className="ctabar">
        <span className="ctabar__meta">
          Nº {String(ep.number).padStart(3, "0")} · closes in {countdown ?? "……"}
        </span>
        {reserved ? (
          <button
            className="btn btn--ghostlight"
            onClick={() => document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" })}
          >
            Reserved · see your ticket
          </button>
        ) : (
          <button
            className="btn btn--red"
            onClick={() =>
              (vote
                ? document.getElementById("claim")
                : ballotRef.current
              )?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {vote ? `Book my seat · ${seatsLeft[vote]} left` : "Take a side · join the conversation"}
          </button>
        )}
      </div>
    </div>
  );
}
