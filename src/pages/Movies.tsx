import * as React from "react"
import {
  Bookmark,
  Check,
  Clapperboard,
  Film,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react"
import { useLocation } from "react-router"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "src/components/ui/sheet"
import { Textarea } from "src/components/ui/textarea"
import {
  api,
  type ExternalMovieRating,
  type MovieDetails,
  type MovieListStatus,
  type MovieRecommendation,
  type MovieSearchResult,
  type UserMovie,
  type UserMovieUpdate,
} from "src/lib/api"
import { cn } from "src/lib/utils"

const today = () => new Date().toISOString().slice(0, 10)

const ratingStyles: Record<string, string> = {
  "Internet Movie Database": "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  "Rotten Tomatoes": "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  Metacritic: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
}

function Poster({ src, title, className }: { src: string | null; title: string; className?: string }) {
  if (src) {
    return <img src={src} alt={`${title} poster`} loading="lazy" className={cn("bg-muted object-cover", className)} />
  }
  return (
    <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)} aria-label={`No poster available for ${title}`}>
      <Film className="size-10" />
    </div>
  )
}

function RatingTiles({ ratings }: { ratings: ExternalMovieRating[] }) {
  if (ratings.length === 0) {
    return <p className="text-sm text-muted-foreground">No external ratings are available for this title yet.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ratings.map((rating) => (
        <div key={rating.source} className={cn("rounded-xl border p-3", ratingStyles[rating.source] ?? "bg-muted/50")}>
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide opacity-75" title={rating.source}>{rating.source.replace("Internet Movie Database", "IMDb")}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{rating.value}</p>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: MovieListStatus }) {
  return status === "WATCHED"
    ? <Badge className="gap-1 bg-emerald-100 text-emerald-800"><Check className="size-3" />Watched</Badge>
    : <Badge variant="secondary" className="gap-1"><Bookmark className="size-3" />Want to watch</Badge>
}

function MovieGrid({ movies, onSelect }: { movies: UserMovie[]; onSelect: (movie: UserMovie) => void }) {
  if (movies.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20 py-16">
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-muted p-4"><Clapperboard className="size-7 text-muted-foreground" /></div>
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Discover a movie and add it to this collection.</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <button key={movie.id} type="button" onClick={() => onSelect(movie)} className="group overflow-hidden rounded-xl border bg-card text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Poster src={movie.poster_url} title={movie.title} className="size-full transition duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 text-white">
              {movie.personal_rating && <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-xs font-semibold backdrop-blur"><Star className="size-3 fill-amber-400 text-amber-400" />{Number(movie.personal_rating).toFixed(1)}</span>}
            </div>
          </div>
          <div className="p-3">
            <p className="truncate font-medium">{movie.title}</p>
            <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{movie.year ?? "Year unknown"}</span><span>{movie.runtime ?? ""}</span></div>
          </div>
        </button>
      ))}
    </div>
  )
}

type MovieSheetProps = {
  details: MovieDetails | null
  movie: UserMovie | null
  isLoading: boolean
  onClose: () => void
  onAdd: (status: MovieListStatus) => Promise<void>
  onUpdate: (input: UserMovieUpdate) => Promise<void>
  onDelete: () => Promise<void>
}

function MovieSheet({ details, movie, isLoading, onClose, onAdd, onUpdate, onDelete }: MovieSheetProps) {
  const [draft, setDraft] = React.useState<UserMovieUpdate>({
    list_status: movie?.list_status ?? "WATCHED",
    personal_rating: movie?.personal_rating ?? null,
    critique: movie?.critique ?? "",
    watched_at: movie?.watched_at ?? today(),
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [localError, setLocalError] = React.useState("")
  const item = movie ?? details

  async function run(action: () => Promise<void>) {
    setLocalError("")
    setIsSaving(true)
    try { await action() }
    catch (reason) { setLocalError(reason instanceof Error ? reason.message : "Could not save this movie.") }
    finally { setIsSaving(false) }
  }

  function changeStatus(status: MovieListStatus) {
    setDraft((current) => ({
      ...current,
      list_status: status,
      personal_rating: status === "WATCHED" ? current.personal_rating : null,
      watched_at: status === "WATCHED" ? current.watched_at ?? today() : null,
    }))
  }

  return (
    <Sheet open={Boolean(details || movie || isLoading)} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        {isLoading || !item ? (
          <div className="flex h-full items-center justify-center"><LoaderCircle className="size-7 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <Poster src={item.poster_url} title={item.title} className="size-full object-cover blur-xl opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/20 to-transparent" />
              <Poster src={item.poster_url} title={item.title} className="absolute bottom-3 left-4 h-36 w-24 rounded-lg shadow-xl" />
            </div>
            <SheetHeader className="pt-0">
              <div className="ml-28 min-h-11">
                <SheetTitle className="text-xl">{item.title}</SheetTitle>
                <SheetDescription>{[item.year, item.runtime, item.content_rating].filter(Boolean).join(" · ")}</SheetDescription>
              </div>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-4">
              {movie && <StatusBadge status={movie.list_status} />}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Critics & audiences</h3>
                <RatingTiles ratings={item.external_ratings} />
                <p className="text-[11px] text-muted-foreground">Scores are supplied by OMDb and remain the property of their respective sources. Availability varies by title.</p>
              </section>
              {item.plot && <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Story</h3><p className="leading-6 text-foreground/85">{item.plot}</p></section>}
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {item.director && <div><dt className="text-xs text-muted-foreground">Director</dt><dd>{item.director}</dd></div>}
                {item.genre && <div><dt className="text-xs text-muted-foreground">Genre</dt><dd>{item.genre}</dd></div>}
                {item.released && <div><dt className="text-xs text-muted-foreground">Released</dt><dd>{item.released}</dd></div>}
                {item.country && <div><dt className="text-xs text-muted-foreground">Country</dt><dd>{item.country}</dd></div>}
                {item.language && <div><dt className="text-xs text-muted-foreground">Language</dt><dd>{item.language}</dd></div>}
                {item.box_office && <div><dt className="text-xs text-muted-foreground">Box office</dt><dd>{item.box_office}</dd></div>}
                {item.actors && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Cast</dt><dd>{item.actors}</dd></div>}
                {item.awards && <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">Awards</dt><dd>{item.awards}</dd></div>}
              </dl>

              {movie && (
                <form onSubmit={(event) => { event.preventDefault(); void run(() => onUpdate(draft)) }} className="space-y-4 rounded-xl border bg-muted/20 p-4">
                  <div>
                    <h3 className="font-medium">Your movie note</h3>
                    <p className="text-xs text-muted-foreground">Keep it in your queue or record what you thought after watching.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={draft.list_status === "WANT_TO_WATCH" ? "default" : "outline"} onClick={() => changeStatus("WANT_TO_WATCH")}><Bookmark />Want to watch</Button>
                    <Button type="button" variant={draft.list_status === "WATCHED" ? "default" : "outline"} onClick={() => changeStatus("WATCHED")}><Check />Watched</Button>
                  </div>
                  {draft.list_status === "WATCHED" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><label className="text-sm font-medium" htmlFor="movie-rating">Your score</label><div className="relative"><Star className="absolute left-2.5 top-2 size-4 fill-amber-400 text-amber-400" /><Input id="movie-rating" className="pl-8" type="number" min="1" max="10" step="0.5" value={draft.personal_rating ?? ""} onChange={(event) => setDraft({ ...draft, personal_rating: event.target.value || null })} placeholder="1–10" /></div></div>
                      <div className="space-y-2"><label className="text-sm font-medium" htmlFor="movie-watched-at">Watched on</label><Input id="movie-watched-at" type="date" max={today()} value={draft.watched_at ?? ""} onChange={(event) => setDraft({ ...draft, watched_at: event.target.value || null })} /></div>
                    </div>
                  )}
                  <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-sm font-medium" htmlFor="movie-critique">Short critique</label><span className="text-xs text-muted-foreground">{draft.critique?.length ?? 0}/2000</span></div><Textarea id="movie-critique" maxLength={2000} value={draft.critique ?? ""} onChange={(event) => setDraft({ ...draft, critique: event.target.value })} placeholder="What worked, what did not, and what stayed with you?" className="min-h-28" /></div>
                  {localError && <p className="text-sm text-destructive">{localError}</p>}
                  <div className="flex justify-between gap-2"><Button type="button" variant="destructive" onClick={() => void run(onDelete)} disabled={isSaving}><Trash2 />Remove</Button><Button type="submit" disabled={isSaving}>{isSaving ? <LoaderCircle className="animate-spin" /> : <Check />}{isSaving ? "Saving…" : "Save changes"}</Button></div>
                </form>
              )}
            </div>
            {!movie && (
              <SheetFooter className="sticky bottom-0 border-t bg-popover/95 backdrop-blur">
                {localError && <p className="text-sm text-destructive">{localError}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => void run(() => onAdd("WANT_TO_WATCH"))} disabled={isSaving}><Bookmark />Want to watch</Button>
                  <Button onClick={() => void run(() => onAdd("WATCHED"))} disabled={isSaving}>{isSaving ? <LoaderCircle className="animate-spin" /> : <Check />}Mark watched</Button>
                </div>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default function Movies() {
  const location = useLocation()
  const mode: "discover" | "want" | "watched" | "suggestions" = location.pathname.endsWith("want-to-watch") ? "want" : location.pathname.endsWith("watched") ? "watched" : location.pathname.endsWith("suggestions") ? "suggestions" : "discover"
  const [movies, setMovies] = React.useState<UserMovie[]>([])
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<MovieSearchResult[]>([])
  const [resultCount, setResultCount] = React.useState(0)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false)
  const [selectedDetails, setSelectedDetails] = React.useState<MovieDetails | null>(null)
  const [selectedMovie, setSelectedMovie] = React.useState<UserMovie | null>(null)
  const [recommendations, setRecommendations] = React.useState<MovieRecommendation[]>([])
  const [isRecommending, setIsRecommending] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    api.movies.list()
      .then(setMovies)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load your movie library."))
      .finally(() => setIsLoading(false))
  }, [])

  const visibleMovies = movies.filter((movie) => mode === "want" ? movie.list_status === "WANT_TO_WATCH" : mode === "watched" ? movie.list_status === "WATCHED" : true)
  const ratedMovieCount = movies.filter((movie) => movie.list_status === "WATCHED" && movie.personal_rating !== null).length
  const pageCopy = mode === "want"
    ? { eyebrow: "Movie library", title: "Want to watch", description: "The films waiting for the right night." }
    : mode === "watched"
      ? { eyebrow: "Movie library", title: "Watched & rated", description: "Your viewing history, personal scores, and short critiques." }
      : mode === "suggestions"
        ? { eyebrow: "Personal recommendations", title: "AI movie suggestions", description: "Four verified movies chosen from the taste signals in your 10 most recently rated films." }
        : { eyebrow: "Movie library", title: "Discover movies", description: "Search the movie catalogue, compare ratings, and build your personal watch history." }

  async function searchMovies(event: React.FormEvent) {
    event.preventDefault()
    const cleanQuery = query.trim()
    if (cleanQuery.length < 2) return
    setError(""); setIsSearching(true); setHasSearched(true)
    try { const response = await api.movies.search(cleanQuery); setResults(response.results); setResultCount(response.total_results) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not search for movies."); setResults([]) }
    finally { setIsSearching(false) }
  }

  async function openResult(result: MovieSearchResult) {
    if (result.library_id) {
      const saved = movies.find((movie) => movie.id === result.library_id)
      if (saved) { setSelectedMovie(saved); return }
      setIsLoadingDetails(true); setError("")
      try { setSelectedMovie(await api.movies.get(result.library_id)) }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load the saved movie.") }
      finally { setIsLoadingDetails(false) }
      return
    }
    setSelectedDetails(null); setIsLoadingDetails(true); setError("")
    try { setSelectedDetails(await api.movies.details(result.imdb_id)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load movie details.") }
    finally { setIsLoadingDetails(false) }
  }

  async function addMovie(status: MovieListStatus) {
    if (!selectedDetails) return
    const created = await api.movies.add(selectedDetails.imdb_id, status)
    setMovies((current) => [created, ...current])
    setResults((current) => current.map((result) => result.imdb_id === created.imdb_id ? { ...result, library_id: created.id, list_status: created.list_status } : result))
    setRecommendations((current) => current.filter((movie) => movie.imdb_id !== created.imdb_id))
    setSelectedDetails(null)
    setSelectedMovie(created)
  }

  async function updateMovie(input: UserMovieUpdate) {
    if (!selectedMovie) return
    const updated = await api.movies.update(selectedMovie.id, input)
    setMovies((current) => current.map((movie) => movie.id === updated.id ? updated : movie))
    setResults((current) => current.map((result) => result.imdb_id === updated.imdb_id ? { ...result, list_status: updated.list_status } : result))
    setSelectedMovie(updated)
  }

  async function deleteMovie() {
    if (!selectedMovie) return
    const deleted = selectedMovie
    await api.movies.delete(deleted.id)
    setMovies((current) => current.filter((movie) => movie.id !== deleted.id))
    setResults((current) => current.map((result) => result.imdb_id === deleted.imdb_id ? { ...result, library_id: null, list_status: null } : result))
    setSelectedMovie(null)
  }

  async function generateRecommendation() {
    setError("")
    setIsRecommending(true)
    try { setRecommendations((await api.movies.recommend()).recommendations) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not generate a movie recommendation.") }
    finally { setIsRecommending(false) }
  }

  return (
    <>
      <PageHeader {...pageCopy} action={mode === "want" || mode === "watched" ? <div className="rounded-xl border bg-card px-4 py-2 text-sm"><span className="font-semibold">{visibleMovies.length}</span> <span className="text-muted-foreground">movies</span></div> : undefined} />
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {mode === "suggestions" ? (
        <>
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-card to-indigo-50 dark:from-violet-950/25 dark:via-card dark:to-indigo-950/25">
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-violet-300/20 blur-3xl" />
            <CardContent className="relative grid items-center gap-6 py-4 md:grid-cols-[1fr_auto]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200"><Sparkles className="size-6" /></div>
                <div><p className="font-semibold">Recommendations shaped by your taste</p><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">We send only movie metadata, your scores, and short critiques from your 10 latest ratings. Account identity is excluded, and every generated title is verified through OMDb before you see it.</p></div>
              </div>
              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <Button size="lg" onClick={() => void generateRecommendation()} disabled={isLoading || isRecommending || ratedMovieCount < 3}>
                  {isRecommending ? <LoaderCircle className="animate-spin" /> : recommendations.length > 0 ? <RefreshCw /> : <Sparkles />}
                  {isRecommending ? "Finding matches…" : recommendations.length > 0 ? "Try another set" : "Suggest movies"}
                </Button>
                <p className="text-center text-xs text-muted-foreground md:text-right">{Math.min(ratedMovieCount, 10)} rated movies available · minimum 3</p>
              </div>
            </CardContent>
          </Card>

          {isRecommending && (
            <Card className="overflow-hidden"><div className="grid min-h-96 animate-pulse md:grid-cols-[260px_1fr]"><div className="bg-muted" /><div className="space-y-4 p-8"><div className="h-8 w-2/3 rounded bg-muted" /><div className="h-4 w-1/3 rounded bg-muted" /><div className="mt-10 h-24 rounded bg-muted" /><div className="h-16 rounded bg-muted" /></div></div></Card>
          )}

          {!isRecommending && recommendations.length > 0 && (() => {
            const [recommendation, ...alternatives] = recommendations
            return (
              <div className="space-y-4">
                <Card className="overflow-hidden py-0">
                  <div className="grid md:grid-cols-[280px_1fr]">
                    <div className="relative min-h-96 bg-muted"><Poster src={recommendation.poster_url} title={recommendation.title} className="absolute inset-0 size-full" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-24 text-white"><Badge className="mb-2 bg-white/15 text-white backdrop-blur"><Sparkles className="mr-1 size-3" />Best AI match</Badge><p className="text-xs text-white/75">Verified through OMDb</p></div></div>
                    <div className="flex flex-col p-6 sm:p-8">
                      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Tonight's top suggestion</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{recommendation.title}</h2><p className="mt-1 text-sm text-muted-foreground">{[recommendation.year, recommendation.runtime, recommendation.content_rating].filter(Boolean).join(" · ")}</p></div>
                      <blockquote className="my-6 border-l-2 border-violet-400 pl-4 text-base leading-7 text-foreground/85">{recommendation.recommendation_reason}</blockquote>
                      <div className="mb-6 flex flex-wrap gap-2">{recommendation.matched_preferences.map((preference) => <Badge key={preference} variant="secondary">{preference}</Badge>)}</div>
                      <RatingTiles ratings={recommendation.external_ratings} />
                      <div className="mt-6"><p className="mb-2 text-xs font-medium text-muted-foreground">Based on your recent ratings</p><div className="flex flex-wrap gap-2">{recommendation.based_on.slice(0, 5).map((movie) => <span key={movie.title} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"><Star className="size-3 fill-amber-400 text-amber-400" />{movie.title} · {Number(movie.personal_rating).toFixed(1)}</span>)}</div></div>
                      <div className="mt-auto flex justify-end pt-8"><Button onClick={() => setSelectedDetails(recommendation)}>View details & add</Button></div>
                    </div>
                  </div>
                </Card>

                {alternatives.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-end justify-between gap-4"><div><h3 className="font-semibold">More matches for you</h3><p className="text-sm text-muted-foreground">Three alternatives from the same taste profile.</p></div><p className="hidden text-xs text-muted-foreground sm:block">Select a movie to inspect it</p></div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {alternatives.map((movie, index) => (
                        <Card key={movie.imdb_id} className="group cursor-pointer overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md" onClick={() => setSelectedDetails(movie)}>
                          <div className="grid min-h-48 grid-cols-[112px_1fr] md:min-h-64 md:grid-cols-1 md:grid-rows-[180px_1fr]">
                            <div className="relative bg-muted"><Poster src={movie.poster_url} title={movie.title} className="absolute inset-0 size-full" /><Badge className="absolute left-2 top-2 bg-black/60 text-white backdrop-blur">#{index + 2} match</Badge></div>
                            <div className="flex min-w-0 flex-col p-4">
                              <div><h4 className="truncate font-semibold" title={movie.title}>{movie.title}</h4><p className="mt-0.5 text-xs text-muted-foreground">{[movie.year, movie.runtime].filter(Boolean).join(" · ")}</p></div>
                              <p className="mt-3 line-clamp-3 text-sm leading-5 text-muted-foreground">{movie.recommendation_reason}</p>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-4"><div className="flex min-w-0 gap-1">{movie.matched_preferences.slice(0, 1).map((preference) => <Badge key={preference} variant="secondary" className="max-w-32 truncate">{preference}</Badge>)}</div><Button variant="ghost" size="sm" className="shrink-0" onClick={(event) => { event.stopPropagation(); setSelectedDetails(movie) }}>View</Button></div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {!isRecommending && recommendations.length === 0 && !error && (
            <Card className="border-dashed py-16"><CardContent className="flex flex-col items-center text-center"><div className="mb-4 rounded-2xl bg-muted p-4"><Sparkles className="size-7 text-muted-foreground" /></div><p className="font-medium">Your next movie starts with your ratings</p><p className="mt-1 max-w-md text-sm text-muted-foreground">Rate at least three watched movies. Better scores and critiques produce a more personal recommendation.</p></CardContent></Card>
          )}
        </>
      ) : mode === "discover" ? (
        <>
          <Card className="bg-gradient-to-br from-card to-muted/40">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-4" />Find your next movie</CardTitle><CardDescription>Search by title. Open a result to see every rating source available before adding it.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={searchMovies} className="flex gap-2">
                <div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-10 pl-9 text-base" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try The Matrix, Parasite, or Dune…" aria-label="Movie title" autoFocus /></div>
                <Button size="lg" className="h-10 px-4" disabled={isSearching || query.trim().length < 2}>{isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}Search</Button>
              </form>
            </CardContent>
          </Card>

          {hasSearched && <div className="flex items-end justify-between"><div><h2 className="text-lg font-semibold">Search results</h2><p className="text-sm text-muted-foreground">{isSearching ? "Searching the catalogue…" : `${resultCount.toLocaleString()} matching titles`}</p></div></div>}
          {!hasSearched && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                [Search, "Search the catalogue", "Find movies by title through OMDb."],
                [Bookmark, "Build your queue", "Save films for later without rating them yet."],
                [Star, "Remember your take", "Score watched films and write a concise critique."],
              ].map(([Icon, title, description]) => (
                <Card key={title as string}><CardContent><div className="mb-4 inline-flex rounded-xl bg-muted p-2.5"><Icon className="size-5" /></div><p className="font-medium">{title as string}</p><p className="mt-1 text-sm text-muted-foreground">{description as string}</p></CardContent></Card>
              ))}
            </div>
          )}
          {isSearching && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />)}</div>}
          {!isSearching && results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((result) => (
                <button key={result.imdb_id} type="button" onClick={() => void openResult(result)} className="group overflow-hidden rounded-xl border bg-card text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <div className="relative aspect-[2/3] overflow-hidden"><Poster src={result.poster_url} title={result.title} className="size-full transition duration-300 group-hover:scale-[1.03]" />{result.list_status && <div className="absolute left-2 top-2"><StatusBadge status={result.list_status} /></div>}</div>
                  <div className="p-3"><p className="truncate font-medium">{result.title}</p><p className="mt-1 text-xs text-muted-foreground">{result.year ?? "Year unknown"}</p></div>
                </button>
              ))}
            </div>
          )}
          {hasSearched && !isSearching && results.length === 0 && <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">No movies matched that title. Try a shorter or alternate title.</CardContent></Card>}
        </>
      ) : isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="size-7 animate-spin text-muted-foreground" /></div>
      ) : <MovieGrid movies={visibleMovies} onSelect={setSelectedMovie} />}

      <MovieSheet
        key={selectedMovie?.id ?? selectedDetails?.imdb_id ?? "movie-sheet"}
        details={selectedDetails}
        movie={selectedMovie}
        isLoading={isLoadingDetails}
        onClose={() => { setSelectedDetails(null); setSelectedMovie(null); setIsLoadingDetails(false) }}
        onAdd={addMovie}
        onUpdate={updateMovie}
        onDelete={deleteMovie}
      />
    </>
  )
}
